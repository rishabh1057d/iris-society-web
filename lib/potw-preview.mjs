export const POTW_TEST_BRANCH = "feature/potw-platform"

export function potwPreviewAllowed(env) {
  return env.VERCEL_ENV === "preview" && env.VERCEL_GIT_COMMIT_REF === POTW_TEST_BRANCH &&
    env.VERCEL_GIT_REPO_OWNER === "rishabh1057d" && env.VERCEL_GIT_REPO_SLUG === "iris-society-web" &&
    env.POTW_PREVIEW_ENABLED === "1" && env.POTW_TEST_MODE === "1"
}

export function potwTestMode(env) {
  return potwPreviewAllowed(env) || (!env.VERCEL_ENV && env.POTW_TEST_MODE === "1")
}
