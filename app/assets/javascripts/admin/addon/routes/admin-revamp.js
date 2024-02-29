import { inject as service } from "@ember/service";
import { ADMIN_PANEL, MAIN_PANEL } from "discourse/lib/sidebar/panels";
import DiscourseURL from "discourse/lib/url";
import DiscourseRoute from "discourse/routes/discourse";
import I18n from "discourse-i18n";

export default class AdminRoute extends DiscourseRoute {
  @service siteSettings;
  @service currentUser;
  @service sidebarState;

  titleToken() {
    return I18n.t("admin_title");
  }

  activate() {
    if (!this.currentUser.use_admin_sidebar) {
      return DiscourseURL.redirectTo("/admin");
    }

    this.sidebarState.setPanel(ADMIN_PANEL);
    this.sidebarState.setSeparatedMode();
    this.sidebarState.hideSwitchPanelButtons();

    this.controllerFor("application").setProperties({
      showTop: false,
    });
  }

  deactivate(transition) {
    this.controllerFor("application").set("showTop", true);
    if (!transition?.to.name.startsWith("admin")) {
      this.sidebarState.setPanel(MAIN_PANEL);
    }
  }
}
