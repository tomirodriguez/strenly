/**
 * Error definitions for oRPC procedures
 * Error messages are in Spanish (user-facing)
 */

export const commonErrors = {
	INTERNAL_ERROR: { message: "Error interno del servidor" },
	VALIDATION_ERROR: { message: "Datos invalidos" },
	NOT_FOUND: { message: "Recurso no encontrado" },
};

export const authErrors = {
	UNAUTHORIZED: { message: "No autenticado" },
	FORBIDDEN: { message: "No tienes permisos para esta accion" },
	ORG_NOT_FOUND: { message: "Organizacion no encontrada" },
	NOT_A_MEMBER: { message: "No eres miembro de esta organizacion" },
};
