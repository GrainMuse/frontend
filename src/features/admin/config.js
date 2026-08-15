import {
  Archive,
  Boxes,
  FileJson,
  Inbox,
  LayoutDashboard,
  UserPlus,
  Users,
} from "lucide-react";

export const ADMIN_SECTIONS = Object.freeze([
  ["overview", "Overview", LayoutDashboard],
  ["products", "Products", Boxes],
  ["categories", "Categories", Archive],
  ["team", "Team", Users],
  ["content", "Site content", FileJson],
  ["enquiries", "Enquiries", Inbox],
  ["staff", "Staff access", UserPlus],
]);

export const EMPTY_RECORDS = Object.freeze({
  products: {
    name: "",
    slug: "",
    subtitle: "",
    categoryId: "",
    desc: "",
    status: "draft",
    displayOrder: 0,
    color: "#BF9A56",
    tags: [],
  },
  categories: { name: "", slug: "", status: "draft", displayOrder: 0 },
  team: {
    name: "",
    slug: "",
    position: "",
    dept: "",
    desc: "",
    status: "draft",
    displayOrder: 0,
    skills: [],
  },
  content: { key: "", value: {}, status: "draft" },
});

export function sectionRecordType(section) {
  if (["categories", "team", "content"].includes(section)) return section;
  return "products";
}

export function canViewSection(section, role) {
  return !["enquiries", "staff"].includes(section) || role === "admin";
}
