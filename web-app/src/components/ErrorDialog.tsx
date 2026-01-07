import React from 'react';
import AlertDialog from './AlertDialog';

type ErrorDialogProps = any;

const ErrorDialog: React.FC<ErrorDialogProps> = (props) => {
  // Map legacy props: { open, title, message, onClose }
  const { open, title, message, onClose, ...rest } = props || {};
  return (
    <AlertDialog
      variant="error"
      open={!!open}
      onClose={onClose || (() => {})}
      title={title || 'Lỗi'}
      description={message || ''}
      actionText="Đóng"
      actionColor="error"
      {...rest}
    />
  );
};

export default ErrorDialog;
