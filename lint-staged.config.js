// ESLint must run inside each workspace (its .eslintrc and tsconfig.json are
// resolved relative to the working directory), so we call the workspace script
// instead of passing file names. Prettier then formats exactly the staged files.
export default {
  'apps/api/src/**/*.ts': [
    () => 'npm run lint:fix -w apps/api',
    'prettier --write',
  ],
  'apps/web/src/**/*.{js,ts,tsx}': [
    () => 'npm run lint:fix -w apps/web',
    'prettier --write',
  ],
};
