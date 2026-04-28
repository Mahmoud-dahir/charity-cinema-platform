import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewEventPage from "@/app/dashboard/events/new/page";


const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock("@/components/dashboard/Header", () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

jest.mock("@/components/dashboard/Sidebar", () => ({
  Sidebar: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));


const mockUser = { id: 1, username: "testuser", email: "test@example.com" };
const mockCategories = [
  { id: 1, slug: "action", name: "Action" },
  { id: 2, slug: "comedy", name: "Comédie" },
];

function setupFetch({
  user = mockUser as any,
  categories = mockCategories,
  submitOk = true,
  submitError = null as object | null,
  networkError = false,
}: {
  user?: { id: number; username: string; email: string } | null;
  categories?: any[];
  submitOk?: boolean;
  submitError?: object | null;
  networkError?: boolean;
} = {}) {
  (global.fetch as jest.Mock).mockImplementation((url: string, init?: RequestInit) => {
    if (url === "/api/auth/me") {
      return Promise.resolve({
        ok: !!user,
        json: () => Promise.resolve(user),
      });
    }
    if (url === "/api/events/categories/") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(categories),
      });
    }
    if (url === "/api/events/" && init?.method === "POST") {
      if (networkError) return Promise.reject(new Error("Network failure"));
      if (submitOk) return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve(submitError ?? { detail: "error" }),
      });
    }
    return Promise.reject(new Error(`Unhandled fetch: ${url}`));
  });
}

async function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/titre de l'événement/i), { target: { value: "Soirée Test" } });
  fireEvent.change(screen.getByLabelText(/titre du film/i), { target: { value: "Inception" } });
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Une belle soirée cinéma." } });
  fireEvent.change(screen.getByLabelText(/date et heure de début/i), { target: { value: "2025-09-01T20:00" } });
  fireEvent.change(screen.getByLabelText(/lieu/i), { target: { value: "Cinéma Bellecour" } });
}


beforeEach(() => {
  global.fetch = jest.fn();
  window.alert = jest.fn();
  mockPush.mockClear();
  mockReplace.mockClear();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("NewEventPage", () => {

  it("renders the page with form elements", async () => {
    setupFetch();
    render(<NewEventPage />);

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
    expect(screen.getByText(/créer un nouvel événement/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/titre de l'événement/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/titre du film/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date et heure de début/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date et heure de fin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lieu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/capacité max/i)).toBeInTheDocument();
  });

  it("renders a link back to the events list", () => {
    setupFetch();
    render(<NewEventPage />);
    const link = screen.getByRole("link", { name: /retour à mes événements/i });
    expect(link).toHaveAttribute("href", "/dashboard/events");
  });

  it("renders submit and cancel buttons", () => {
    setupFetch();
    render(<NewEventPage />);
    expect(screen.getByRole("button", { name: /créer le brouillon/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /annuler/i })).toBeInTheDocument();
  });

  it("shows the draft explanation in the description", () => {
    setupFetch();
    render(<NewEventPage />);
    expect(screen.getByText(/brouillon/i)).toBeInTheDocument();
  });


  it("redirects to / when the user is not authenticated", async () => {
    setupFetch({ user: null });
    render(<NewEventPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("redirects to / on a network error during init", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network failure"));
    render(<NewEventPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("renders categories returned by the API", async () => {
    setupFetch();
    render(<NewEventPage />);

    await waitFor(() => {
      expect(screen.getByText("Action")).toBeInTheDocument();
      expect(screen.getByText("Comédie")).toBeInTheDocument();
    });
  });

  it("renders no category buttons when the API returns an empty list", async () => {
    setupFetch({ categories: [] });
    render(<NewEventPage />);

    await waitFor(() => {
      expect(screen.queryByText("Action")).not.toBeInTheDocument();
    });
  });


  it("updates input values when the user types", async () => {
    setupFetch();
    render(<NewEventPage />);

    const titleInput = screen.getByLabelText(/titre de l'événement/i);
    fireEvent.change(titleInput, { target: { value: "Mon Événement" } });
    expect(titleInput).toHaveValue("Mon Événement");
  });

  it("toggles a category on click (select then deselect)", async () => {
    setupFetch();
    render(<NewEventPage />);

    await waitFor(() => screen.getByText("Action"));

    const actionBtn = screen.getByText("Action").closest("button")!;
    expect(actionBtn).not.toHaveClass("bg-yellow-100");

    fireEvent.click(actionBtn);
    expect(actionBtn).toHaveClass("bg-yellow-100");

    fireEvent.click(actionBtn);
    expect(actionBtn).not.toHaveClass("bg-yellow-100");
  });

  it("can select multiple categories simultaneously", async () => {
    setupFetch();
    render(<NewEventPage />);

    await waitFor(() => screen.getByText("Action"));

    fireEvent.click(screen.getByText("Action").closest("button")!);
    fireEvent.click(screen.getByText("Comédie").closest("button")!);

    expect(screen.getByText("Action").closest("button")).toHaveClass("bg-yellow-100");
    expect(screen.getByText("Comédie").closest("button")).toHaveClass("bg-yellow-100");
  });


  it("submits the form and redirects to /dashboard/events on success", async () => {
    setupFetch({ submitOk: true });
    render(<NewEventPage />);

    await fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /créer le brouillon/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/events");
    });
  });

  it("calls fetch POST /api/events/ on submit", async () => {
    setupFetch({ submitOk: true });
    render(<NewEventPage />);

    await fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /créer le brouillon/i }));

    await waitFor(() => {
      const postCall = (global.fetch as jest.Mock).mock.calls.find(
        ([url, init]) => url === "/api/events/" && init?.method === "POST"
      );
      expect(postCall).toBeDefined();
    });
  });

  it("sends selected categories in the FormData", async () => {
    setupFetch({ submitOk: true });
    render(<NewEventPage />);

    await waitFor(() => screen.getByText("Action"));
    fireEvent.click(screen.getByText("Action").closest("button")!);

    await fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /créer le brouillon/i }));

    await waitFor(() => {
      const postCall = (global.fetch as jest.Mock).mock.calls.find(
        ([url, init]) => url === "/api/events/" && init?.method === "POST"
      );
      expect(postCall).toBeDefined();
      const body: FormData = postCall[1].body;
      expect(body.getAll("categories")).toContain("action");
    });
  });


  it("disables the submit button while loading", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUser) });
      }
      if (url === "/api/events/categories/") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return new Promise(() => {});
    });

    render(<NewEventPage />);
    await fillRequiredFields();

    const submitBtn = screen.getByRole("button", { name: /créer le brouillon/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
      expect(submitBtn).toHaveTextContent(/enregistrement/i);
    });
  });


  it("shows an alert when the server returns a non-OK response", async () => {
    setupFetch({ submitOk: false, submitError: { detail: "Données invalides" } });
    render(<NewEventPage />);

    await fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /créer le brouillon/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining("Erreur lors de la création de l'événement")
      );
    });
  });

  it("shows an alert on network error", async () => {
    setupFetch({ networkError: true });
    render(<NewEventPage />);

    await fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /créer le brouillon/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Erreur réseau.");
    });
  });

  it("re-enables the submit button after a failed submission", async () => {
    setupFetch({ submitOk: false });
    render(<NewEventPage />);

    await fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /créer le brouillon/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /créer le brouillon/i })).not.toBeDisabled();
    });
  });


  it("navigates to /dashboard/events when cancel is clicked", () => {
    setupFetch();
    render(<NewEventPage />);

    fireEvent.click(screen.getByRole("button", { name: /annuler/i }));
    expect(mockPush).toHaveBeenCalledWith("/dashboard/events");
  });


  it("includes capacity in FormData when provided", async () => {
    setupFetch({ submitOk: true });
    render(<NewEventPage />);

    await fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/capacité max/i), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: /créer le brouillon/i }));

    await waitFor(() => {
      const postCall = (global.fetch as jest.Mock).mock.calls.find(
        ([url, init]) => url === "/api/events/" && init?.method === "POST"
      );
      const body: FormData = postCall[1].body;
      expect(body.get("capacity")).toBe("100");
    });
  });

  it("does not include empty optional fields in FormData", async () => {
    setupFetch({ submitOk: true });
    render(<NewEventPage />);

    await fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /créer le brouillon/i }));

    await waitFor(() => {
      const postCall = (global.fetch as jest.Mock).mock.calls.find(
        ([url, init]) => url === "/api/events/" && init?.method === "POST"
      );
      const body: FormData = postCall[1].body;
      expect(body.get("capacity")).toBeNull();
      expect(body.get("ends_at")).toBeNull();
    });
  });
});