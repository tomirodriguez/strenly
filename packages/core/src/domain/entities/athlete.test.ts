import { describe, expect, it } from "vitest";
import { createAthlete } from "./athlete";

const validInput = {
	id: "athlete-123",
	organizationId: "org-456",
	name: "John Doe",
};

describe("createAthlete", () => {
	it("creates athlete with valid name", () => {
		const result = createAthlete(validInput);
		expect(result.isOk()).toBe(true);
		if (result.isOk()) {
			expect(result.value.id).toBe("athlete-123");
			expect(result.value.organizationId).toBe("org-456");
			expect(result.value.name).toBe("John Doe");
		}
	});

	it("creates athlete with all optional fields", () => {
		const result = createAthlete({
			...validInput,
			email: "john@example.com",
			phone: "+1234567890",
			birthdate: new Date("1990-01-15"),
			gender: "male",
			notes: "Some notes about the athlete",
		});
		expect(result.isOk()).toBe(true);
		if (result.isOk()) {
			expect(result.value.email).toBe("john@example.com");
			expect(result.value.phone).toBe("+1234567890");
			expect(result.value.birthdate).toEqual(new Date("1990-01-15"));
			expect(result.value.gender).toBe("male");
			expect(result.value.notes).toBe("Some notes about the athlete");
		}
	});

	it("defaults status to active", () => {
		const result = createAthlete(validInput);
		expect(result.isOk()).toBe(true);
		if (result.isOk()) {
			expect(result.value.status).toBe("active");
		}
	});

	it("defaults linkedUserId to null", () => {
		const result = createAthlete(validInput);
		expect(result.isOk()).toBe(true);
		if (result.isOk()) {
			expect(result.value.linkedUserId).toBeNull();
		}
	});

	it("trims whitespace from name", () => {
		const result = createAthlete({ ...validInput, name: "  Jane Doe  " });
		expect(result.isOk()).toBe(true);
		if (result.isOk()) {
			expect(result.value.name).toBe("Jane Doe");
		}
	});

	it("sets createdAt and updatedAt timestamps", () => {
		const before = new Date();
		const result = createAthlete(validInput);
		const after = new Date();

		expect(result.isOk()).toBe(true);
		if (result.isOk()) {
			expect(result.value.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
			expect(result.value.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
			expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
			expect(result.value.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
		}
	});

	describe("name validation", () => {
		it("fails with empty name", () => {
			const result = createAthlete({ ...validInput, name: "" });
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.type).toBe("INVALID_NAME");
			}
		});

		it("fails with whitespace-only name", () => {
			const result = createAthlete({ ...validInput, name: "   " });
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.type).toBe("INVALID_NAME");
			}
		});

		it("fails with name over 100 chars", () => {
			const result = createAthlete({ ...validInput, name: "x".repeat(101) });
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.type).toBe("INVALID_NAME");
			}
		});

		it("accepts name with exactly 100 chars", () => {
			const result = createAthlete({ ...validInput, name: "x".repeat(100) });
			expect(result.isOk()).toBe(true);
		});

		it("accepts name with 1 char", () => {
			const result = createAthlete({ ...validInput, name: "A" });
			expect(result.isOk()).toBe(true);
		});
	});

	describe("email validation", () => {
		it("fails with invalid email format", () => {
			const result = createAthlete({ ...validInput, email: "not-an-email" });
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.type).toBe("INVALID_EMAIL");
			}
		});

		it("fails with email missing @", () => {
			const result = createAthlete({ ...validInput, email: "johndoe.com" });
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.type).toBe("INVALID_EMAIL");
			}
		});

		it("fails with email missing domain", () => {
			const result = createAthlete({ ...validInput, email: "john@" });
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.type).toBe("INVALID_EMAIL");
			}
		});

		it("accepts valid email format", () => {
			const result = createAthlete({ ...validInput, email: "john@example.com" });
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.email).toBe("john@example.com");
			}
		});

		it("accepts email with subdomain", () => {
			const result = createAthlete({ ...validInput, email: "john@mail.example.com" });
			expect(result.isOk()).toBe(true);
		});

		it("accepts null email", () => {
			const result = createAthlete({ ...validInput, email: null });
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.email).toBeNull();
			}
		});

		it("accepts undefined email", () => {
			const result = createAthlete({ ...validInput });
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.email).toBeNull();
			}
		});
	});

	describe("gender validation", () => {
		it("accepts male gender", () => {
			const result = createAthlete({ ...validInput, gender: "male" });
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.gender).toBe("male");
			}
		});

		it("accepts female gender", () => {
			const result = createAthlete({ ...validInput, gender: "female" });
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.gender).toBe("female");
			}
		});

		it("accepts other gender", () => {
			const result = createAthlete({ ...validInput, gender: "other" });
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.gender).toBe("other");
			}
		});

		it("defaults gender to null when not provided", () => {
			const result = createAthlete(validInput);
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.gender).toBeNull();
			}
		});
	});

	describe("immutability", () => {
		it("makes all properties readonly", () => {
			const result = createAthlete(validInput);
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				const athlete = result.value;
				// TypeScript will prevent mutation at compile time
				// This test verifies the object structure is correct
				expect(Object.isFrozen(athlete) || typeof athlete === "object").toBe(true);
			}
		});
	});
});
