"use client";
import { useState } from "react";
import { useSpaces, type AurisSpace } from "../lib/useSpaces";
import { SpaceList } from "./SpaceList";
import { SpaceFormModal } from "./SpaceFormModal";
import { Modal } from "./Modal";
import { SpaceView } from "./SpaceView";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, Plus } from "lucide-react";

export function AurisLMApp() {
  const {
    spaces,
    loading,
    createSpace,
    updateSpace,
    deleteSpace,
  } = useSpaces();

  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState<AurisSpace | null>(null);
  const [deletingSpace, setDeletingSpace] = useState<AurisSpace | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const activeSpace = spaces.find((s) => s.id === activeSpaceId) ?? null;

  const handleCreate = async (name: string, description?: string) => {
    const space = await createSpace(name, description);
    if (space) setActiveSpaceId(space.id);
  };

  const handleEdit = async (name: string, description?: string) => {
    if (!editingSpace) return;
    await updateSpace(editingSpace.id, name, description);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSpace) return;
    setDeleteLoading(true);
    const ok = await deleteSpace(deletingSpace.id);
    setDeleteLoading(false);
    if (ok && activeSpaceId === deletingSpace.id) {
      setActiveSpaceId(null);
    }
    setDeletingSpace(null);
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-5">
      {/* Left sidebar: spaces */}
      <aside className="w-64 shrink-0 flex flex-col rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <SpaceList
          spaces={spaces}
          activeSpaceId={activeSpaceId}
          loading={loading}
          onSelect={setActiveSpaceId}
          onCreateClick={() => setShowCreateModal(true)}
          onEditClick={(s) => setEditingSpace(s)}
          onDeleteClick={(s) => setDeletingSpace(s)}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {activeSpace ? (
          <SpaceView space={activeSpace} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-2xl border bg-card/50 backdrop-blur-sm text-center px-12 shadow-sm">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/5 blur-2xl animate-pulse" />
              <BookOpen className="relative size-16 text-primary/40" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Bienvenido a AurisLM</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tu espacio inteligente para análisis de documentos. Sube PDFs, audios o pega texto para empezar a chatear con tu propio contenido.
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={() => setShowCreateModal(true)}
              className="rounded-full px-8 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <Plus className="mr-2 size-4" />
              Crear mi primer espacio
            </Button>
          </div>
        )}
      </main>

      {/* Create/Edit space modal */}
      <SpaceFormModal
        open={showCreateModal || !!editingSpace}
        editingSpace={editingSpace}
        onClose={() => {
          setShowCreateModal(false);
          setEditingSpace(null);
        }}
        onSubmit={editingSpace ? handleEdit : handleCreate}
      />

      {/* Delete confirm modal */}
      <Modal
        open={!!deletingSpace}
        onClose={() => setDeletingSpace(null)}
        title="Eliminar espacio"
      >
        <p className="text-sm text-muted-foreground mb-4">
          ¿Estás seguro de que quieres eliminar{" "}
          <span className="font-semibold text-foreground">
            {deletingSpace?.name}
          </span>
          ? Se eliminarán todos los documentos y el historial del chat.
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeletingSpace(null)}
            disabled={deleteLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleDeleteConfirm()}
            disabled={deleteLoading}
          >
            <Trash2 className="size-4" />
            {deleteLoading ? "Eliminando…" : "Eliminar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
