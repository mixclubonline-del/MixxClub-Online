/**
 * MixxClub ESLint Plugin
 * 
 * Custom rules enforcing architectural boundaries:
 * - no-direct-navigate: Enforces Fabric Flow navigation system
 */

const noDirectNavigate = require('./no-direct-navigate.cjs');

module.exports = {
  rules: {
    'no-direct-navigate': noDirectNavigate,
  },
  configs: {
    recommended: {
      plugins: ['mixxclub'],
      rules: {
        'mixxclub/no-direct-navigate': 'error',
      },
    },
  },
};
