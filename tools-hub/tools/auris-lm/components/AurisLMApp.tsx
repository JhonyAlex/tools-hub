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
    <div className="flex h-[calc(100vh-12rem)] flex-col lg:flex-row gap-8">
      {/* Configuration / Spaces side panel - moved to Right on desktop (or top on mobile) */}
      <aside className="w-full lg:w-72 shrink-0 flex flex-col order-first lg:order-last border-b lg:border-b-0 lg:border-l border-border/50 pb-6 lg:pb-0 lg:pl-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">Tus Espacios</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <SpaceList
            spaces={spaces}
            activeSpaceId={activeSpaceId}
            loading={loading}
            onSelect={setActiveSpaceId}
            onCreateClick={() => setShowCreateModal(true)}
            onEditClick={(s) => setEditingSpace(s)}
            onDeleteClick={(s) => setDeletingSpace(s)}
          />
        </div>
      </aside>

      {/* Main content - Chat/Workspace */}
      <main className="flex-1 min-w-0 flex flex-col h-full rounded-xl bg-card border shadow-sm overflow-hidden order-last lg:order-first">
        {activeSpace ? (
          <SpaceView space={activeSpace} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-muted/10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight mb-2">Bienvenido a AurisLM</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
              Tu espacio inteligente para análisis de documentos. Sube PDFs, audios o pega texto para generar una base de conocimiento propia.
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="rounded-full px-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear nuevo espacio
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
