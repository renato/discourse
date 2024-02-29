import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Chat | Hashtag CSS Generator", function (needs) {
  const category1 = { id: 1, color: "ff0000", name: "category1" };
  const category2 = { id: 2, color: "333", name: "category2" };
  const category3 = {
    id: 4,
    color: "2B81AF",
    parentCategory: { id: 1 },
    name: "category3",
  };

  needs.settings({ chat_enabled: true });
  needs.user({
    has_chat_enabled: true,
    chat_channels: {
      public_channels: [
        {
          id: 44,
          chatable_id: 1,
          chatable_type: "Category",
          meta: { message_bus_last_ids: {} },
          current_user_membership: { following: true },
          chatable: category1,
        },
        {
          id: 74,
          chatable_id: 2,
          chatable_type: "Category",
          meta: { message_bus_last_ids: {} },
          current_user_membership: { following: true },
          chatable: category2,
        },
        {
          id: 88,
          chatable_id: 4,
          chatable_type: "Category",
          meta: { message_bus_last_ids: {} },
          current_user_membership: { following: true },
          chatable: category3,
        },
      ],
      direct_message_channels: [],
      meta: { message_bus_last_ids: {} },
      tracking: {
        channel_tracking: {
          44: { unread_count: 0, mention_count: 0 },
          74: { unread_count: 0, mention_count: 0 },
          88: { unread_count: 0, mention_count: 0 },
        },
        thread_tracking: {},
      },
    },
  });
  needs.site({
    categories: [category1, category2, category3],
  });

  test("hashtag CSS classes are generated", async function (assert) {
    await visit("/");
    const cssTag = document.querySelector("style#hashtag-css-generator");
    assert.equal(
      cssTag.innerHTML,
      ".hashtag-category-badge { background-color: var(--primary-medium); }\n" +
        ".hashtag-color--category-1 { background-color: #ff0000; }\n" +
        ".hashtag-color--category-2 { background-color: #333; }\n" +
        ".hashtag-color--category-4 { background-color: #2B81AF; }\n" +
        ".d-icon.hashtag-color--channel-44 { color: #ff0000 }\n" +
        ".d-icon.hashtag-color--channel-74 { color: #333 }\n" +
        ".d-icon.hashtag-color--channel-88 { color: #2B81AF }"
    );
  });
});
