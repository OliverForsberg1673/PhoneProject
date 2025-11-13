import * as jose from "jose";

const secret = new TextEncoder().encode(
  "GIo1kkI927PuvzXu7oBC5XzDdS2HIYRqan2zeEnx5CfJcih9UwfUyUbGUIyufztex"
);
const alg = "HS256";

export async function generateToken(data) {
  try {
    return await new jose.SignJWT(data)
      .setProtectedHeader({ alg })
      .sign(secret);
  } catch (e) {
    console.error(e);
    throw new Error(
      `Failed to generate token with data: ${data} and error message: ${e}`
    );
  }
}

export async function validateToken(token) {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (e) {
    console.error(e);
    throw new Error(`Failed to verify token: ${e}`);
  }
}
