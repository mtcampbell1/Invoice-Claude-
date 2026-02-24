import "@testing-library/jest-dom";
import { vi } from "vitest";

// Suppress expected console.error noise in tests
vi.spyOn(console, "error").mockImplementation(() => {});
