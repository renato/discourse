# frozen_string_literal: true

require "rails_helper"

RSpec.describe ApplicationController do
  fab!(:user)
  fab!(:admin)

  def preloaded_json
    JSON.parse(
      Nokogiri::HTML5.fragment(response.body).css("div#data-preloaded").first["data-preloaded"],
    )
  end

  before do
    SiteSetting.chat_enabled = true
    SiteSetting.chat_allowed_groups = Group::AUTO_GROUPS[:trust_level_0]
  end

  context "when user is admin" do
    it "has correctly loaded preloaded data for enabledPluginAdminRoutes" do
      sign_in(admin)
      get "/latest"
      expect(JSON.parse(preloaded_json["enabledPluginAdminRoutes"])).to include(
        { "label" => "chat.admin.title", "location" => "chat" },
      )
    end
  end

  context "when user is not admin" do
    it "does not include preloaded data for enabledPluginAdminRoutes" do
      sign_in(user)
      get "/latest"
      expect(preloaded_json["enabledPluginAdminRoutes"]).to eq(nil)
    end
  end
end
