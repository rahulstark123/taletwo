/**
 * DEVELOPMENT FIXTURES: family circle. Milestone 1 placeholder data only.
 * Names and relationships are invented. Replaced by Prisma queries when the
 * family module is connected to the database.
 */
export const devFamilyMembers = [
  { id: "f1", name: "Asha", relationship: "Parent", role: "contributor" as const, status: "Joined", lastSeen: "2026-11-07" },
  { id: "f2", name: "Vikram", relationship: "Sibling", role: "viewer" as const, status: "Joined", lastSeen: "2026-11-02" },
  { id: "f3", name: "Meera", relationship: "Aunt or uncle", role: "viewer" as const, status: "Invite pending", lastSeen: null },
];

export const devFamilyPlans = [
  {
    id: "fp1",
    title: "Diwali dinner at Asha's",
    when: "2026-11-20T18:30:00Z",
    place: "Home, Pune",
    going: 4,
    invited: 5,
    yourRsvp: "Going" as const,
  },
  {
    id: "fp2",
    title: "Mom's birthday brunch",
    when: "2026-12-06T10:00:00Z",
    place: "Blue Door Cafe",
    going: 2,
    invited: 3,
    yourRsvp: "Not answered" as const,
  },
];

export const devFamilyAlbum = [
  { id: "fa1", title: "Sunday lunch at Asha's", date: "2026-10-12", photos: 14, tone: "rose" as const },
  { id: "fa2", title: "Vikram's graduation", date: "2026-08-30", photos: 22, tone: "sage" as const },
];
