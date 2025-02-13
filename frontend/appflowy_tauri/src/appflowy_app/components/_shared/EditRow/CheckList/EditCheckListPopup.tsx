import { CellIdentifier } from '$app/stores/effects/database/cell/cell_bd_svc';
import { KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectOptionPB } from '@/services/backend';
import { SelectOptionCellBackendService } from '$app/stores/effects/database/cell/select_option_bd_svc';
import { TrashSvg } from '$app/components/_shared/svg/TrashSvg';
import { PopupWindow } from '$app/components/_shared/PopupWindow';

export const EditCheckListPopup = ({
  left,
  top,
  cellIdentifier,
  editingSelectOption,
  onOutsideClick,
}: {
  left: number;
  top: number;
  cellIdentifier: CellIdentifier;
  editingSelectOption: SelectOptionPB;
  onOutsideClick: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(editingSelectOption.name);
  }, [editingSelectOption]);

  const onKeyDown: KeyboardEventHandler = async (e) => {
    if (e.key === 'Enter' && value.length > 0) {
      await new SelectOptionCellBackendService(cellIdentifier).createOption({ name: value });
      setValue('');
    }
  };

  const onKeyDownWrapper: KeyboardEventHandler = (e) => {
    if (e.key === 'Escape') {
      onOutsideClick();
    }
  };

  const onBlur = async () => {
    const svc = new SelectOptionCellBackendService(cellIdentifier);
    await svc.updateOption(
      new SelectOptionPB({
        id: editingSelectOption.id,
        name: value,
      })
    );
  };

  const onDeleteOptionClick = async () => {
    const svc = new SelectOptionCellBackendService(cellIdentifier);
    await svc.deleteOption([editingSelectOption]);
    onOutsideClick();
  };

  return (
    <PopupWindow
      className={'p-2 text-xs'}
      onOutsideClick={async () => {
        await onBlur();
        onOutsideClick();
      }}
      left={left}
      top={top}
    >
      <div onKeyDown={onKeyDownWrapper} className={'flex flex-col gap-2 p-2'}>
        <div className={'border-shades-3 flex flex-1 items-center gap-2 rounded border bg-main-selector px-2 '}>
          <input
            ref={inputRef}
            className={'py-2'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => onBlur()}
          />
          <div className={'font-mono text-shade-3'}>{value.length}/30</div>
        </div>
        <button
          onClick={() => onDeleteOptionClick()}
          className={
            'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-main-alert hover:bg-main-secondary'
          }
        >
          <i className={'h-5 w-5'}>
            <TrashSvg></TrashSvg>
          </i>
          <span>{t('grid.selectOption.deleteTag')}</span>
        </button>
      </div>
    </PopupWindow>
  );
};
