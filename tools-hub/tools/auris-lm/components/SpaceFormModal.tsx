"use client";
import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AurisSpace } from "../lib/useSpaces";

interface SpaceFormModalProps {
  open: boolean;
  editingSpace?: AurisSpace | null;
  onClose: () => void;
  onSubmit: (name: string, description?: string) => Promise<void>;
}

export function SpaceFormModal({
  open,
  editingSpace,
  onClose,
  onSubmit,
}: SpaceFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = !!editingSpace;

  useEffect(() => {
    if (open) {
      setName(editingSpace?.name ?? "");
      setDescription(editingSpace?.description ?? "");
    }
  }, [open, editingSpace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit(name.trim(), description.trim() || undefined);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar espacio" : "Nuevo espacio"}
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="space-name">
            Nombre <span className="text-destructive">*</span>
          </label>
          <Input
            id="space-name"
            placeholder="Ej: Proyecto Alfa, Contratos 2026…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            autoFocus
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="space-desc">
            Descripción{" "}
            <span className="text-muted-foreground text-xs">(opcional)</span>
          </label>
          <Input
            id="space-desc"
            placeholder="Breve descripción del espacio…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear espacio"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
