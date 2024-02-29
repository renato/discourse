import { inject as service } from "@ember/service";
import { ADMIN_PANEL, MAIN_PANEL } from "discourse/lib/sidebar/panels";
import DiscourseRoute from "discourse/routes/discourse";
import I18n from "discourse-i18n";

export default class AdminRoute extends DiscourseRoute {
  @service sidebarState;
  @service siteSettings;
  @service currentUser;

  titleToken() {
    return I18n.t("admin_title");
  }

  activate() {
    if (this.currentUser.use_admin_sidebar) {
      this.sidebarState.setPanel(ADMIN_PANEL);
      this.sidebarState.setSeparatedMode();
      this.sidebarState.hideSwitchPanelButtons();
    }

    this.controllerFor("application").setProperties({
      showTop: false,
    });
  }

  deactivate(transition) {
    this.controllerFor("application").set("showTop", true);

    if (this.currentUser.use_admin_sidebar) {
      if (!transition?.to.name.startsWith("admin")) {
        this.sidebarState.setPanel(MAIN_PANEL);
      }
    }
  }
}
