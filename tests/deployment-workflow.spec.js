const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'browser-validation.yml');

function readWorkflow() {
  return fs.readFileSync(workflowPath, 'utf8');
}

test('Pages workflow uses current official actions and validated output', () => {
  const workflow = readWorkflow();

  expect(workflow).toContain('actions/checkout@v6');
  expect(workflow).toContain('actions/setup-node@v6');
  expect(workflow).toContain('actions/upload-artifact@v7');
  expect(workflow).toContain('actions/configure-pages@v5');
  expect(workflow).toContain('actions/upload-pages-artifact@v4');
  expect(workflow).toContain('actions/deploy-pages@v4');
  expect(workflow).toContain('run: npm run test:e2e');
  expect(workflow).toContain('path: _site');

  const validationIndex = workflow.indexOf('run: npm run test:e2e');
  const pagesArtifactIndex = workflow.indexOf('actions/upload-pages-artifact@v4');
  expect(validationIndex).toBeGreaterThan(-1);
  expect(pagesArtifactIndex).toBeGreaterThan(validationIndex);
});

test('Pages deployment is restricted to validated non-PR runs', () => {
  const workflow = readWorkflow();

  expect(workflow).toContain('workflow_dispatch:');
  expect(workflow).toContain('- master');
  expect(workflow).toContain("if: github.event_name != 'pull_request'");
  expect(workflow).toContain('needs: build');
  expect(workflow).toContain('name: github-pages');
  expect(workflow).toContain('pages: write');
  expect(workflow).toContain('id-token: write');
  expect(workflow).toContain('url: ${{ steps.deployment.outputs.page_url }}');
});

test('Pages workflow serializes deployment attempts without cancelling active deploys', () => {
  const workflow = readWorkflow();

  expect(workflow).toContain('group: pages-${{ github.workflow }}-${{ github.ref }}');
  expect(workflow).toContain('cancel-in-progress: false');
});
