'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  Download,
  Eye,
  History,
  Paperclip,
  Shield,
  Type,
  Underline,
  Bold,
  Italic,
  ListOrdered,
  List,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { showErrorToast, showSuccessToast } from '@/lib/sweetalert-config';
import {
  createClinicalNote,
  getClinicalNotes,
  type CreateClinicalNotePayload,
} from '@/lib/api/assessment';
import type { ClinicalNote } from '@/types/assessment';
import { sanitizeClinicalNotes } from '@/lib/utils/sanitize';

interface ClinicalNotesEditorProps {
  assessmentId: number;
}

type Visibility = 'internal' | 'shared' | 'private';

const toolbarActions = [
  { icon: Bold, command: 'bold', label: 'Bold' },
  { icon: Italic, command: 'italic', label: 'Italic' },
  { icon: Underline, command: 'underline', label: 'Underline' },
  { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered list' },
  { icon: List, command: 'insertUnorderedList', label: 'Bulleted list' },
];

const visibilityOptions: { value: Visibility; title: string; description: string }[] = [
  {
    value: 'internal',
    title: 'Internal Team',
    description: 'Visible to PHC validation team only',
  },
  {
    value: 'shared',
    title: 'Share with Mobile User',
    description: 'Sends note to the originating health worker',
  },
  {
    value: 'private',
    title: 'Private Draft',
    description: 'Keep for yourself until ready to share',
  },
];

export function ClinicalNotesEditor({ assessmentId }: ClinicalNotesEditorProps) {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>('internal');
  const [shareWithMobile, setShareWithMobile] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getClinicalNotes(assessmentId);
      if (response.success) {
        setNotes(response.data);
      }
    } catch (error) {
      console.error('Failed to load notes', error);
      await showErrorToast('Unable to load clinical notes');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const latestNotes = useMemo(() => notes ?? [], [notes]);

  const handleToolbarAction = (command: string) => {
    document.execCommand(command, false);
  };

  // Removed basic sanitizeContent - now using comprehensive sanitizeClinicalNotes utility

  const resetEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setAttachments([]);
    setSelectedNoteId(null);
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    const rawHtml = sanitizeClinicalNotes(editorRef.current.innerHTML.trim());
    if (!rawHtml || rawHtml === '<br>') {
      await showErrorToast('Please enter clinical notes before saving.');
      return;
    }

    setIsSaving(true);
    const payload: CreateClinicalNotePayload = {
      content: rawHtml,
      visibility,
      mobile_visible: shareWithMobile && visibility === 'shared',
      parent_note_id: selectedNoteId ?? undefined,
      attachments,
    };

    try {
      const response = await createClinicalNote(assessmentId, payload);
      if (response.success) {
        await showSuccessToast('Clinical note saved');
        resetEditor();
        await fetchNotes();
      }
    } catch (error) {
      console.error('Failed to save note', error);
      await showErrorToast(
        'Unable to save clinical note',
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    setAttachments((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNoteSelection = (noteId: number) => {
    setSelectedNoteId(noteId === selectedNoteId ? null : noteId);
  };

  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Clinical Notes & Attachments</CardTitle>
        <CardDescription>
          Document bedside context, share instructions with mobile teams, and keep attachments
          versioned per note.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          {/* Editor */}
          <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Type className="text-heart-red h-4 w-4" strokeWidth={1.5} />
                Rich Text Annotation
              </div>
              {selectedNoteId && (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  Updating note #{selectedNoteId}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
              {toolbarActions.map(({ icon: Icon, command, label }) => (
                <Button
                  key={command}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="hover:text-heart-red text-slate-600"
                  onClick={() => handleToolbarAction(command)}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  <span className="sr-only">{label}</span>
                </Button>
              ))}
            </div>
            <div
              ref={editorRef}
              className="min-h-[180px] rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800 focus:outline-none"
              contentEditable
              aria-label="Clinical notes rich text editor"
            />
            <div className="grid gap-4 md:grid-cols-2">
              {visibilityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVisibility(option.value)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    visibility === option.value
                      ? 'border-heart-red bg-heart-red/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {option.value === 'shared' ? (
                      <BadgeCheck className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
                    ) : option.value === 'internal' ? (
                      <Shield className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                    ) : (
                      <History className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
                    )}
                    <p className="text-sm font-semibold text-slate-800">{option.title}</p>
                  </div>
                  <p className="text-xs text-slate-500">{option.description}</p>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Switch
                id="share-with-mobile"
                checked={shareWithMobile}
                onCheckedChange={setShareWithMobile}
                disabled={visibility !== 'shared'}
              />
              <div>
                <Label htmlFor="share-with-mobile" className="text-sm">
                  Notify mobile user
                </Label>
                <p className="text-xs text-slate-500">
                  Sends push notification when visibility is set to &quot;shared&quot;.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Attachments</Label>
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-6 text-center">
                <UploadCloud className="mx-auto mb-2 h-6 w-6 text-slate-400" strokeWidth={1.5} />
                <p className="text-sm text-slate-600">
                  Drag and drop or select up to 5 files (images or PDFs)
                </p>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleAttachmentChange}
                  className="mt-3 cursor-pointer text-sm"
                />
              </div>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <Badge key={`${file.name}-${index}`} variant="outline" className="gap-2">
                      <Paperclip className="h-3 w-3" strokeWidth={1.5} />
                      <span className="text-xs">{file.name}</span>
                      <button
                        type="button"
                        className="hover:text-heart-red text-slate-500"
                        onClick={() => removeAttachment(index)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-between gap-3">
              <Button type="button" variant="outline" onClick={resetEditor} disabled={isSaving}>
                Clear
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                  </>
                ) : (
                  'Save Note'
                )}
              </Button>
            </div>
          </div>

          {/* Notes history */}
          <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <History className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
              Version History
              <Badge variant="secondary" className="ml-auto">
                {latestNotes.length} notes
              </Badge>
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading clinical notes...
              </div>
            ) : latestNotes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500">
                No clinical notes recorded yet. Your annotations will appear here.
              </div>
            ) : (
              <div className="space-y-4">
                {latestNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`rounded-xl border p-4 transition ${
                      selectedNoteId === note.id ? 'border-heart-red shadow-sm' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        v{note.current_version}
                      </Badge>
                      <p className="text-sm font-semibold text-slate-800">
                        {note.author
                          ? `${note.author.first_name} ${note.author.last_name}`
                          : 'Clinician'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {note.created_at
                          ? new Date(note.created_at).toLocaleString()
                          : 'Timestamp unavailable'}
                      </p>
                      <Badge
                        className={`ml-auto text-xs ${
                          note.mobile_visible
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {note.mobile_visible ? 'Shared' : 'Internal'}
                      </Badge>
                    </div>
                    <div
                      className="prose prose-sm mt-3 max-w-none text-slate-700"
                      dangerouslySetInnerHTML={{ __html: sanitizeClinicalNotes(note.latest_content || '') }}
                    />
                    {note.versions[note.versions.length - 1]?.attachments?.length ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Attachments
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {note.versions[note.versions.length - 1]?.attachments?.map(
                            (attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:border-heart-red hover:text-heart-red flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600"
                              >
                                <Paperclip className="h-3 w-3" strokeWidth={1.5} />
                                {attachment.file_name || attachment.filename}
                                <Download className="h-3 w-3" strokeWidth={1.5} />
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    ) : null}
                    <Separator className="my-3" />
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="hover:text-heart-red px-2 text-slate-500"
                        onClick={() => handleNoteSelection(note.id)}
                      >
                        <History className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
                        {selectedNoteId === note.id ? 'Cancel update' : 'Update note'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="px-2 text-slate-500 hover:text-slate-900"
                        onClick={() => {
                          const version = note.versions[note.versions.length - 1];
                          if (editorRef.current && version) {
                            editorRef.current.innerHTML = sanitizeClinicalNotes(version.content);
                            setSelectedNoteId(note.id);
                            setVisibility(
                              (version.visibility as Visibility) ?? (note.visibility as Visibility)
                            );
                            setShareWithMobile(version.visibility === 'shared');
                          }
                        }}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
                        Load into editor
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
