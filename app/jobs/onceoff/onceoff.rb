# frozen_string_literal: true

class Jobs::Onceoff < ::Jobs::Base
  sidekiq_options retry: false

  class << self
    @@onceoff_job_klasses = Set.new

    def inherited(klass)
      @@onceoff_job_klasses << klass
    end

    def onceoff_job_klasses
      @@onceoff_job_klasses
    end
  end

  def self.name_for(klass)
    klass.name.sub(/\AJobs\:\:/, "")
  end

  def running_key_name
    "#{self.class.name}:running"
  end

  # Pass `force: true` to force it happen again
  def execute(args)
    job_name = self.class.name_for(self.class)
    has_lock = Discourse.redis.setnx(running_key_name, Time.now.to_i)

    # If we can't get a lock, just noop
    if args[:force] || has_lock
      begin
        return if OnceoffLog.where(job_name: job_name).exists? && !args[:force]
        execute_onceoff(args)
        OnceoffLog.create!(job_name: job_name)
      ensure
        Discourse.redis.del(running_key_name) if has_lock
      end
    end
  end

  def self.enqueue_all
    previously_ran = OnceoffLog.pluck(:job_name).uniq

    self.onceoff_job_klasses.each do |klass|
      job_name = name_for(klass)
      Jobs.enqueue(job_name.underscore.to_sym) if previously_ran.exclude?(job_name)
    end
  end
end
