export type OrganizationContext = {
	organizationId: string;
	userId: string;
	memberRole: "owner" | "admin" | "member";
};
