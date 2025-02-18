const fs = require('fs');
const path = require('path');

// Load the template.json file
const template = require('./template.json');

// Helper function to convert kebab-case to PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Function to generate the component files
function generateComponentFiles(componentKey, componentData) {
  const componentName = componentData.name;
  const pascalCaseName = toPascalCase(componentName); // Convert to PascalCase
  const componentsDir = path.join(__dirname, 'components'); // Create a 'components' directory
  const componentDir = path.join(componentsDir, componentName); // Create a subdirectory for the component

  // Create the components directory if it doesn't exist
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir);
  }

  // Create the component directory if it doesn't exist
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir);
  }

  // Generate index.tsx
  const indexTsxContent = `import { ${pascalCaseName}Props } from './model';

const ${pascalCaseName}: React.FC<${pascalCaseName}Props> = ({
  ${Object.keys(componentData.props)
    .map((prop) => prop.replace('?', ''))
    .join(',\n  ')}
}) => {
  return (
    <div className="${componentData.class}">
      {/* Your JSX here */}
    </div>
  );
};

export default ${pascalCaseName};
`;

  fs.writeFileSync(path.join(componentDir, 'index.tsx'), indexTsxContent);

  // Generate model.ts
  const modelTsContent = `export interface ${pascalCaseName}Props {
  ${Object.entries(componentData.props)
    .map(([propName, propType]) => {
      let type = propType;
      if (Array.isArray(propType)) {
        type = propType.map((t) => `'${t}'`).join(' | '); // Convert array to union type
      }
      return `${propName.replace('?', '')}${propName.endsWith('?') ? '?' : ''}: ${type}`;
    })
    .join(';\n  ')}
};
`;

  fs.writeFileSync(path.join(componentDir, 'model.ts'), modelTsContent);

  // Generate style.scss
  const styleScssContent = `.${componentData.class} {}`;
  fs.writeFileSync(path.join(componentDir, 'style.scss'), styleScssContent);

  // Generate ${pascalCaseName}.stories.tsx
  const storiesTsxContent = `import type { Meta, StoryObj } from '@storybook/react';

import ${pascalCaseName} from '.';

const meta = {
  component: ${pascalCaseName},
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ textAlign: 'center' }}>
        <img
          src="images/custom-card-4.png"
          alt="Description of image"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ${pascalCaseName}>;

export default meta;

type Story = StoryObj<typeof meta>;

// use the component interface to create story
export const ${pascalCaseName}Story: Story = {
  args: {
    ${Object.keys(componentData.props)
      .map(
        (propName) =>
          `${propName.replace('?', '')}: '${propName.replace('?', '')}'`
      )
      .join(',\n    ')}
  },
};
`;

  fs.writeFileSync(
    path.join(componentDir, `${pascalCaseName}.stories.tsx`),
    storiesTsxContent
  );

  console.log(`Generated files for ${pascalCaseName}`);
}

// Iterate over each component in the template and generate files
Object.entries(template).forEach(([componentKey, componentData]) => {
  generateComponentFiles(componentKey, componentData);
});