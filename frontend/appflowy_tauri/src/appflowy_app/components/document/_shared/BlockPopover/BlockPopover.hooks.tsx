import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Popover from '@mui/material/Popover';
import { useEditingState } from '$app/components/document/_shared/SubscribeBlockEdit.hooks';
import { useAppDispatch } from '$app/stores/store';
import { blockEditActions } from '$app_reducers/document/block_edit_slice';
import { useSubscribeDocument } from '$app/components/document/_shared/SubscribeDoc.hooks';
import { setRectSelectionThunk } from '$app_reducers/document/async-actions/rect_selection';

export function useBlockPopover({
  renderContent,
  onAfterClose,
  onAfterOpen,
  id,
}: {
  id: string;
  onAfterClose?: () => void;
  onAfterOpen?: () => void;
  renderContent: ({ onClose }: { onClose: () => void }) => React.ReactNode;
}) {
  const anchorElRef = useRef<HTMLDivElement>(null);
  const { docId } = useSubscribeDocument();

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const open = Boolean(anchorEl);
  const editing = useEditingState(id);
  const dispatch = useAppDispatch();
  const closePopover = useCallback(() => {
    setAnchorEl(null);
    dispatch(
      blockEditActions.setBlockEditState({
        id: docId,
        state: {
          id,
          editing: false,
        },
      })
    );
    onAfterClose?.();
  }, [dispatch, docId, id, onAfterClose]);

  const selectBlock = useCallback(() => {
    dispatch(
      setRectSelectionThunk({
        docId,
        selection: [id],
      })
    );
  }, [dispatch, docId, id]);

  const openPopover = useCallback(() => {
    setAnchorEl(anchorElRef.current);
    selectBlock();
    onAfterOpen?.();
  }, [onAfterOpen, selectBlock]);

  useEffect(() => {
    if (editing) {
      openPopover();
    }
  }, [editing, openPopover]);

  const contextHolder = useMemo(() => {
    return (
      <Popover
        disableRestoreFocus={true}
        disableAutoFocus={true}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClose={closePopover}
        open={open}
        anchorEl={anchorEl}
      >
        {renderContent({
          onClose: closePopover,
        })}
      </Popover>
    );
  }, [anchorEl, closePopover, open, renderContent]);

  useEffect(() => {
    if (!anchorElRef.current) {
      return;
    }

    const el = anchorElRef.current;

    el.addEventListener('click', selectBlock);
    return () => {
      el.removeEventListener('click', selectBlock);
    };
  }, [selectBlock]);

  return {
    contextHolder,
    openPopover,
    closePopover,
    open,
    anchorElRef,
  };
}
