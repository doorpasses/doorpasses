# DoorPasses Documentation

This directory contains the DoorPasses API documentation built with [Mintlify](https://mintlify.com).

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- Mintlify CLI

### Install Mintlify CLI

```bash
npm install -g mintlify
```

### Run Development Server

```bash
cd apps/docs
mintlify dev
```

The documentation will be available at `http://localhost:3000`

## Documentation Structure

```
apps/docs/
├── mint.json                 # Mintlify configuration
├── introduction.mdx          # Home page
├── quickstart.mdx           # Quick start guide
├── authentication.mdx       # Authentication guide
├── concepts/                # Core concepts
│   ├── access-passes.mdx
│   ├── card-templates.mdx
│   └── webhooks.mdx
├── api-reference/           # API endpoints
│   ├── introduction.mdx
│   ├── access-passes/
│   ├── card-templates/
│   └── wallet/
└── sdks/                    # SDK documentation
    ├── overview.mdx
    ├── node/
    ├── python/
    ├── php/
    ├── ruby/
    ├── java/
    ├── go/
    └── csharp/
```

## Deployment

The documentation is automatically deployed to Mintlify's hosting platform. Any changes pushed to the main branch will trigger a new deployment.

### Mintlify Dashboard

Access the Mintlify dashboard at https://dashboard.mintlify.com to:
- View deployment status
- Configure custom domain
- Monitor analytics
- Manage team access

## Contributing

When adding new documentation:

1. Create `.mdx` files in the appropriate directory
2. Update `mint.json` navigation to include new pages
3. Test locally with `mintlify dev`
4. Submit a pull request

## Writing Documentation

### Frontmatter

Every `.mdx` file should include frontmatter:

```mdx
---
title: 'Page Title'
description: 'Page description for SEO'
---
```

### Components

Mintlify provides special components for rich documentation:

- `<Card>` - Highlight important content
- `<CardGroup>` - Group multiple cards
- `<Accordion>` - Collapsible sections
- `<CodeGroup>` - Multiple code examples with tabs
- `<ParamField>` - Document API parameters
- `<ResponseField>` - Document API responses

See [Mintlify Components](https://mintlify.com/docs/content/components) for full list.

## Support

For issues with the documentation:
- Create an issue in the repository
- Contact the documentation team
- Refer to [Mintlify Documentation](https://mintlify.com/docs)
