import crypto from "crypto";

export function generateRandomToken() {
    return crypto.randomBytes(32).toString("hex");
}
