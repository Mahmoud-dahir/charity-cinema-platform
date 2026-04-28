import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewEventPage from "@/app/dashboard/events/new/page";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock("@/components/dashboard/Header", () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

jest.mock("@/components/dashboard/Sidebar", () => ({
  Sidebar: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

beforeAll(() => {
  window.URL.createObjectURL = jest.fn(() => "blob:test-url");
});

beforeEach(() => {
  jest.clearAllMocks();
  window.alert = jest.fn();
  
  global.fetch = jest.fn((url: string, options?: RequestInit) => {
    if (url === "/api/auth/me") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, email: "test@example.com" }),
      });
    }
    if (url === "/api/events/categories/") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, slug: "action", name: "Action" },
          { id: 2, slug: "comedy", name: "Comédie" }
        ]),
      });
    }
    if (url === "/api/events/" && options?.method === "POST") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 100 }),
      });
    }
    return Promise.reject(new Error(`Unhandled request: ${url}`));
  }) as jest.Mock;
});

describe("NewEventPage", () => {
  it("renders the page and its components", async () => {
    render(<NewEventPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Action")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
    expect(screen.getByLabelText(/Titre de l'événement \*/i)).toBeInTheDocument();
  });

  it("redirects to home if user is not authenticated", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce((url: string) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<NewEventPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("submits the form successfully with all fields", async () => {
    render(<NewEventPage />);

    await waitFor(() => {
      expect(screen.getByText("Action")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Titre de l'événement \*/i), { target: { value: "Test Event" } });
    fireEvent.change(screen.getByLabelText(/Titre du film \*/i), { target: { value: "Test Movie" } });
    fireEvent.change(screen.getByLabelText(/Description \*/i), { target: { value: "Test Description" } });
    fireEvent.change(screen.getByLabelText(/Date et heure de début \*/i), { target: { value: "2026-10-10T20:00" } });
    fireEvent.change(screen.getByLabelText(/Lieu \*/i), { target: { value: "Test Location" } });
    fireEvent.change(screen.getByLabelText(/Capacité max/i), { target: { value: "100" } });

    fireEvent.click(screen.getByText("Action"));

    fireEvent.click(screen.getByRole("button", { name: /Créer le brouillon/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/events");
    });

    const postCall = (global.fetch as jest.Mock).mock.calls.find(call => call[0] === "/api/events/");
    expect(postCall).toBeDefined();
    
    const formData = postCall[1].body as FormData;
    expect(formData.get("title")).toBe("Test Event");
    expect(formData.get("movie_title")).toBe("Test Movie");
    expect(formData.get("categories")).toBe("action");
    expect(formData.get("capacity")).toBe("100");
  });

  it("handles submission errors correctly", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string, options: any) => {
      if (url === "/api/auth/me") return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      if (url === "/api/events/categories/") return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      if (url === "/api/events/" && options?.method === "POST") {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ detail: "Invalid data" }),
        });
      }
      return Promise.resolve({ ok: true });
    });

    render(<NewEventPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Titre de l'événement \*/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Titre de l'événement \*/i), { target: { value: "Test Event" } });
    fireEvent.change(screen.getByLabelText(/Titre du film \*/i), { target: { value: "Test Movie" } });
    fireEvent.change(screen.getByLabelText(/Description \*/i), { target: { value: "Test Description" } });
    fireEvent.change(screen.getByLabelText(/Date et heure de début \*/i), { target: { value: "2026-10-10T20:00" } });
    fireEvent.change(screen.getByLabelText(/Lieu \*/i), { target: { value: "Test Location" } });

    fireEvent.click(screen.getByRole("button", { name: /Créer le brouillon/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Erreur lors de la création"));
    });
    
    expect(mockPush).not.toHaveBeenCalledWith("/dashboard/events");
  });

  it("navigates back when cancel is clicked", async () => {
    render(<NewEventPage />);
    
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Annuler/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Annuler/i }));
    
    expect(mockPush).toHaveBeenCalledWith("/dashboard/events");
  });
});