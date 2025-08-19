// src/components/form/LinksBlock.tsx
import { fetchLinkMetadata } from "@/utils/fetchLinkMetadata";
import { useState } from "react";
import LinkCardList from "../for_mocks/LinkCardList";
import { useLinks } from "@/hooks/useLinks";
import { Link } from "@/types/links";
import { Plus } from "lucide-react";

interface LinksBlockProps {
  linkedToId: string;
  linkedToType?: "request" | "project" | "task";
  onChange?: (links: Link[]) => void;
  disabled?: boolean;
}

export default function LinksBlock({
  linkedToId,
  linkedToType = "request",
  disabled = false,
}: LinksBlockProps) {
  const { links, loading, addLink, removeLink } = useLinks({ linkedToId, linkedToType });
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [isMetaLoading, setIsMetaLoading] = useState(false);

  const handleAddLink = async () => {
    setInputError("");
    if (!inputValue.trim()) {
      setInputError("Please enter a URL.");
      return;
    }

    let url = inputValue.trim();
    if (!/^https?:\/\//.test(url)) {
      url = "https://" + url;
    }

    setIsMetaLoading(true);
    try {
      const meta = await fetchLinkMetadata(url);
      await addLink({
        url,
        title: meta?.title || url.replace(/^https?:\/\//, ""),
        favicon: meta?.favicon || "",
        linkedToId,
        linkedToType,
      });
      setIsAdding(false);
      setInputValue("");
    } catch {
      setInputError("Could not fetch metadata or save the link. Please try again.");
    } finally {
      setIsMetaLoading(false);
    }
  };

  const handleRemove = (idx: number) => {
    const link = links[idx];
    if (link) {
      removeLink(link.id);
    }
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-base font-medium text-[#5E6B66]">Links</label>
        {!isAdding && !disabled && (
          <button
            type="button"
            title="Add a new link"
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#697d67] text-[#697d67] bg-transparent rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        )}
      </div>

      {isAdding && !disabled && (
        <div className="flex items-center gap-1">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-64 px-2 py-1 text-sm border rounded outline-none focus:border-[#758C5D]"
            placeholder="Paste a link..."
            title="Paste a link here"
            autoFocus
            disabled={isMetaLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddLink();
              if (e.key === "Escape") setIsAdding(false);
            }}
          />
          <button type="button" className="px-3 py-1 text-xs text-white bg-[#758C5D] rounded" title="Save this link" onClick={handleAddLink} disabled={isMetaLoading}>
            {isMetaLoading ? "..." : "Save"}
          </button>
          <button type="button" className="ml-1 text-xs text-gray-600" title="Cancel adding a link" onClick={() => setIsAdding(false)} disabled={isMetaLoading}>
            Cancel
          </button>
        </div>
      )}

      {inputError && <div className="text-xs text-red-500">{inputError}</div>}
      
      <LinkCardList links={links} onRemove={handleRemove} />
      
      {loading && <div className="mt-2 text-xs text-gray-400">Loading links...</div>}
    </section>
  );
}