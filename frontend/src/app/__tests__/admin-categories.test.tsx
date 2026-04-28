import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CategoriesAdminPage from "../admin/categories/page";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: mockPush, replace: jest.fn() })),
}));

describe("CategoriesAdminPage", () => {
  const mockCategories = [
    { id: 1, name: "Action", slug: "action", parent: null },
    { id: 2, name: "Comedy", slug: "comedy", parent: null },
    { id: 3, name: "SubAction", slug: "subaction", parent: 1 },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
    window.alert = jest.fn();
    jest.clearAllMocks();
  });

  const setupSuccessfulFetch = () => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url === "/api/categories/") {
        if (options?.method === "POST") return Promise.resolve({ ok: true });
        return Promise.resolve({ ok: true, json: async () => mockCategories });
      }
      if (url.startsWith("/api/categories/")) {
        if (options?.method === "PATCH" || options?.method === "DELETE") return Promise.resolve({ ok: true });
      }
      return Promise.reject(new Error("Unhandled fetch"));
    });
  };

  it("renders the loading state initially", () => {
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {})); 
    render(<CategoriesAdminPage />);
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  it("fetches and displays categories", async () => {
    setupSuccessfulFetch();
    render(<CategoriesAdminPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Action").length).toBeGreaterThan(0);
      expect(screen.getByText("Comedy")).toBeInTheDocument();
      expect(screen.getByText("SubAction")).toBeInTheDocument();
    });
    
    expect(screen.getByText("3 catégories au total")).toBeInTheDocument();
  });

  it("opens the create modal and submits a new category", async () => {
    setupSuccessfulFetch();
    render(<CategoriesAdminPage />);

    await waitFor(() => screen.getByText("Nouvelle catégorie"));
    fireEvent.click(screen.getByText("Nouvelle catégorie"));

    expect(screen.getAllByText("Nouvelle catégorie").length).toBeGreaterThan(1);
    
    const nameInput = screen.getByPlaceholderText(/Ex: Action/i);
    fireEvent.change(nameInput, { target: { value: "Drama" } });
    
    const submitBtn = screen.getByRole("button", { name: /Créer/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/categories/", expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Drama", parent: null }),
      }));
    });
  });

  it("opens the edit modal and updates a category", async () => {
    setupSuccessfulFetch();
    render(<CategoriesAdminPage />);

    await waitFor(() => expect(screen.getAllByText("Action").length).toBeGreaterThan(0));
    
    const editBtns = screen.getAllByTitle("Modifier");
    fireEvent.click(editBtns[0]); 

    expect(screen.getByText(/Modifier "Action"/i)).toBeInTheDocument();
    
    const nameInput = screen.getByDisplayValue("Action");
    fireEvent.change(nameInput, { target: { value: "Action Updated" } });
    
    const submitBtn = screen.getByRole("button", { name: /Enregistrer/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/categories/1/", expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ name: "Action Updated", parent: null }),
      }));
    });
  });

  it("opens the delete confirmation and deletes a category", async () => {
    setupSuccessfulFetch();
    render(<CategoriesAdminPage />);

    await waitFor(() => expect(screen.getAllByText("Action").length).toBeGreaterThan(0));
    
    const deleteBtns = screen.getAllByTitle("Supprimer");
    fireEvent.click(deleteBtns[0]);

    expect(screen.getByText(/Supprimer la catégorie/i)).toBeInTheDocument();
    expect(screen.getByText(/"Action"/i)).toBeInTheDocument();
    
    const confirmBtn = screen.getByText("Supprimer");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/categories/1/", expect.objectContaining({
        method: "DELETE",
      }));
    });
  });

  it("handles fetch errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));
    render(<CategoriesAdminPage />);

    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger les catégories/i)).toBeInTheDocument();
    });
  });
});
