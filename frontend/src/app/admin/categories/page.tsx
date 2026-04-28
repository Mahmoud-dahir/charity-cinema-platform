"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, Pencil, Trash2, X, Check, ChevronRight, Loader2, AlertCircle } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formParent, setFormParent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories/");
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      setError("Impossible de charger les catégories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setFormName("");
    setFormParent("");
    setFormError(null);
    setEditTarget(null);
    setModalMode("create");
  };

  const openEdit = (cat: Category) => {
    setFormName(cat.name);
    setFormParent(cat.parent != null ? String(cat.parent) : "");
    setFormError(null);
    setEditTarget(cat);
    setModalMode("edit");
  };

  const closeModal = () => { setModalMode(null); setEditTarget(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { setFormError("Le nom est requis."); return; }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload: any = { name: formName.trim() };
      if (formParent) payload.parent = parseInt(formParent);
      else payload.parent = null;

      const url = modalMode === "edit" ? `/api/categories/${editTarget!.id}/` : "/api/categories/";
      const method = modalMode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setFormError(err?.name?.[0] || err?.detail || "Une erreur est survenue.");
        return;
      }
      await fetchCategories();
      closeModal();
    } catch {
      setFormError("Erreur réseau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}/`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        await fetchCategories();
        setDeleteTarget(null);
      } else {
        alert("Impossible de supprimer cette catégorie.");
      }
    } catch {
      alert("Erreur réseau.");
    } finally {
      setIsDeleting(false);
    }
  };

  const parentName = (parentId: number | null) => {
    if (!parentId) return null;
    return categories.find(c => c.id === parentId)?.name ?? null;
  };

  // Group: parents first, then children
  const roots = categories.filter(c => !c.parent);
  const children = (parentId: number) => categories.filter(c => c.parent === parentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#facc15]" />
            Gestion des Catégories
          </h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} catégorie{categories.length !== 1 ? "s" : ""} au total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#facc15] text-gray-900 font-semibold px-4 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Chargement…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Aucune catégorie pour le moment.</p>
          <p className="text-sm">Créez votre première catégorie pour commencer.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sous-catégories</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {cat.parent && <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                      <span className="font-semibold text-gray-800">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <code className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-mono">{cat.slug}</code>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {parentName(cat.parent) ?? <span className="text-gray-300 italic">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-500">{children(cat.id).length > 0 ? `${children(cat.id).length} sous-cat.` : <span className="text-gray-300 italic">—</span>}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {modalMode === "create" ? "Nouvelle catégorie" : `Modifier "${editTarget?.name}"`}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Ex: Action, Comédie, Animation…"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie parente (optionnel)</label>
                <select
                  value={formParent}
                  onChange={e => setFormParent(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                >
                  <option value="">— Aucune (catégorie principale) —</option>
                  {categories
                    .filter(c => editTarget ? c.id !== editTarget.id : true)
                    .filter(c => !c.parent)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={isSubmitting} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#facc15] text-gray-900 text-sm font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-60">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {modalMode === "create" ? "Créer" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Supprimer la catégorie</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Êtes-vous sûr de vouloir supprimer <strong>"{deleteTarget.name}"</strong> ? Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
