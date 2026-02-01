/**
 * ESLint Rule: no-direct-navigate
 * 
 * FABRIC BOUNDARY ENFORCEMENT
 * 
 * This rule prevents direct usage of useNavigate() and navigate() outside of
 * the Fabric Flow system (src/core/fabric/).
 * 
 * All navigation in MixxClub must go through the Flow intent system:
 *   ✗ const navigate = useNavigate(); navigate('/path');
 *   ✓ const { setIntent } = useFlow(); setIntent('DEEP_LINK', { path: '/path' });
 * 
 * @see src/core/fabric/FABRIC_BOUNDARY.md
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct useNavigate usage outside of Fabric Flow system',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noDirectNavigate:
        'Direct useNavigate() is forbidden outside src/core/fabric/. Use useFlow().setIntent() instead. See FABRIC_BOUNDARY.md for migration guide.',
      noNavigateImport:
        'Importing useNavigate from react-router-dom is forbidden outside src/core/fabric/. Use useFlow from @/core/fabric/useFlow instead.',
    },
  },

  create(context) {
    const filename = context.getFilename();
    
    // Allow usage within the Fabric core
    if (filename.includes('src/core/fabric/') || filename.includes('src\\core\\fabric\\')) {
      return {};
    }
    
    // Also allow in the FlowProvider if it exists
    if (filename.includes('FlowProvider')) {
      return {};
    }

    return {
      // Check for useNavigate in import declarations
      ImportDeclaration(node) {
        if (node.source.value === 'react-router-dom') {
          const useNavigateSpecifier = node.specifiers.find(
            (spec) =>
              spec.type === 'ImportSpecifier' &&
              spec.imported &&
              spec.imported.name === 'useNavigate'
          );

          if (useNavigateSpecifier) {
            context.report({
              node: useNavigateSpecifier,
              messageId: 'noNavigateImport',
            });
          }
        }
      },

      // Check for useNavigate() calls
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'useNavigate'
        ) {
          context.report({
            node,
            messageId: 'noDirectNavigate',
          });
        }
      },
    };
  },
};
