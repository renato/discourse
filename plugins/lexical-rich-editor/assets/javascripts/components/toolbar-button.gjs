import DButton from "discourse/components/d-button";
import concatClass from "discourse/helpers/concat-class";

<template>
  <DButton
    @type="button"
    data-command={{@command}}
    aria-label={{@label}}
    @action={{@onClick}}
    @icon={{@icon}}
    class={{concatClass
      "btn-flat d-editor-toolbar-button"
      (if @active "--active")
    }}
  />
</template>
