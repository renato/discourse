// import InsertHyperlink from "discourse/components/modal/insert-hyperlink";

export default {
  name: "link",
  label: "Link",
  command() {},
  icon: "link",
  isActive: ({ isLink }) => isLink,
};
