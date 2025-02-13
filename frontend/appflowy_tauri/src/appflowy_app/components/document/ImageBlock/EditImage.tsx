import React, { useCallback, useState } from 'react';
import { Button, TextField, Tabs, Tab, Box } from '@mui/material';
import { useAppDispatch } from '$app/stores/store';
import { updateNodeDataThunk } from '$app_reducers/document/async-actions';
import { useSubscribeDocument } from '$app/components/document/_shared/SubscribeDoc.hooks';
import UploadImage from '$app/components/document/_shared/UploadImage';
import { isTauri } from '$app/utils/env';

enum TAB_KEYS {
  UPLOAD = 'upload',
  LINK = 'link',
}

function EditImage({ id, url, onClose }: { id: string; url: string; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const { controller } = useSubscribeDocument();
  const [linkVal, setLinkVal] = useState<string>(url);
  const [tabKey, setTabKey] = useState<TAB_KEYS>(TAB_KEYS.UPLOAD);
  const handleChange = useCallback((_: React.SyntheticEvent, newValue: TAB_KEYS) => {
    setTabKey(newValue);
  }, []);

  const handleConfirmUrl = useCallback(
    (url: string) => {
      if (!url) return;
      dispatch(
        updateNodeDataThunk({
          id,
          data: {
            url,
          },
          controller,
        })
      );
      onClose();
    },
    [onClose, dispatch, id, controller]
  );

  return (
    <div className={'w-[540px]'}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabKey} onChange={handleChange}>
          {isTauri() && <Tab label={'Upload Image'} value={TAB_KEYS.UPLOAD} />}

          <Tab label='URL Image' value={TAB_KEYS.LINK} />
        </Tabs>
      </Box>
      {isTauri() && (
        <TabPanel value={tabKey} index={TAB_KEYS.UPLOAD}>
          <UploadImage onChange={handleConfirmUrl} />
        </TabPanel>
      )}

      <TabPanel className={'flex flex-col p-3'} value={tabKey} index={TAB_KEYS.LINK}>
        <TextField
          value={linkVal}
          onChange={(e) => setLinkVal(e.target.value)}
          variant='outlined'
          label={'URL'}
          autoFocus={true}
          style={{
            marginBottom: '10px',
          }}
          placeholder={'Please enter the URL of the image'}
        />
        <Button onClick={() => handleConfirmUrl(linkVal)} variant='contained'>
          Upload
        </Button>
      </TabPanel>
    </div>
  );
}

export default EditImage;

interface TabPanelProps {
  children?: React.ReactNode;
  index: TAB_KEYS;
  value: TAB_KEYS;
}

function TabPanel(props: TabPanelProps & React.HTMLAttributes<HTMLDivElement>) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`image-tabpanel-${index}`}
      aria-labelledby={`image-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}
