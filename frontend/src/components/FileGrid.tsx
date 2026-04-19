import React, { useState } from 'react';

interface Props {
  folders: any[];
  files: any[];
  onFolderClick: (id: string) => void;
  onDelete: (type: 'file' | 'folder', id: string) => void;
  onDownload: (id: string, name: string) => void;
  onShare: (item: any) => void;
}

const FILE_ICONS: Record<string, string> = {
  'image/': '🖼️',
  'video/': '🎬',
  'audio/': '🎵',
  'application/pdf': '📕',
  'text/': '📝',
  'application/zip': '📦',
  'application/': '📎',
};

function getIcon(mimeType: string) {
  for (const [k, v] of Object.entries(FILE_ICONS)) {
    if (mimeType?.startsWith(k)) return v;
  }
  return '📄';
}

export default function FileGrid({ folders, files, onFolderClick, onDelete, onDownload, onShare }: Props) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: any; type: 'file' | 'folder' } | null>(null);

  const handleRightClick = (e: React.MouseEvent, item: any, type: 'file' | 'folder') => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item, type });
  };

  const close = () => setContextMenu(null);

  const fmtSize = (b: number) => {
    if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`;
    return `${(b / 1e3).toFixed(0)} KB`;
  };

  if (folders.length === 0 && files.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#475569' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>☁️</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>This folder is empty</div>
        <div style={{ fontSize: 14 }}>Upload files or create a folder to get started</div>
      </div>
    );
  }

  return (
    <div onClick={close}>
      {folders.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Folders</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
            {folders.map((f) => (
              <div
                key={f.id}
                onDoubleClick={() => onFolderClick(f.id)}
                onContextMenu={(e) => handleRightClick(e, f, 'folder')}
                style={{ background: '#1e293b', borderRadius: 10, padding: 16, cursor: 'pointer', border: '1px solid #334155', transition: 'all 0.15s' }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Double-click to open</div>
              </div>
            ))}
          </div>
        </>
      )}

      {files.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Files</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {files.map((f) => (
              <div
                key={f.id}
                onContextMenu={(e) => handleRightClick(e, f, 'file')}
                style={{ background: '#1e293b', borderRadius: 10, padding: 16, cursor: 'context-menu', border: '1px solid #334155' }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{getIcon(f.mimeType || '')}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{fmtSize(Number(f.sizeBytes))}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, zIndex: 200, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'file' && (
            <button onClick={() => { onDownload(contextMenu.item.id, contextMenu.item.name); close(); }} style={menuBtn}>⬇ Download</button>
          )}
          <button onClick={() => { onShare(contextMenu.item); close(); }} style={menuBtn}>🔗 Share</button>
          <div style={{ height: 1, background: '#334155', margin: '4px 0' }} />
          <button onClick={() => { onDelete(contextMenu.type, contextMenu.item.id); close(); }} style={{ ...menuBtn, color: '#ef4444' }}>🗑 Delete</button>
        </div>
      )}
    </div>
  );
}

const menuBtn: React.CSSProperties = {
  display: 'block', width: '100%', padding: '10px 16px', background: 'none',
  border: 'none', color: '#e2e8f0', cursor: 'pointer', textAlign: 'left', fontSize: 14,
};