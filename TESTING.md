# Testing Documentation

This project utilizes Jest for unit testing and Playwright for integration testing. Follow the steps below to run the tests.

## Setup

Before running any tests, make sure to install all required dependencies:

```bash
npm install
```

## Unit Tests

Unit tests focus on isolated utility functions and non-UI logic present in the `src/util/` and `src/model/` directories.

### Running Unit Tests

To execute unit tests, run:

```bash
npm test
```

## Integration Tests

Integration tests validate the robustness of workflows like full questionnaire flows, persistent storage functionality, and configuration parsing. These tests ensure that the application works as expected in a simulated environment.

### Running Integration Tests

Playwright is used for these tests. Execute the following command:

```bash
npm run test:e2e
```

## Adding New Tests

1. **Unit Tests**: Add test files next to utilities or models with a `.test.ts` extension.
2. **Integration Tests**: Create test scripts in the `src/controller/` folder and ensure dependencies like mock services are configured.

### Test Organization

- **Unit Tests**:
  - Targets: Utility functions (`src/util/`) and models (`src/model/`)
  - Example: [`src/util/delay.test.ts`](src/util/delay.test.ts)
- **Integration Tests**:
  - Targets: Application workflows, UI interactions
  - Example: [`src/controller/app.integration.test.ts`](src/controller/app.integration.test.ts)

## Mocking Behavior

The project uses Jest mock functions to simulate external services or browser-specific behaviors.

### Example Mock: LocalStorage

```javascript
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
  writable: true,
});
```

Ensure that mock behaviors are reset for each test using `jest.clearAllMocks()`.
