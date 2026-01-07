import React from 'react';
import AlertDialog from './AlertDialog';

type ConfirmDialogProps = any;

const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  return <AlertDialog variant="confirm" {...props} />;
};

export default ConfirmDialog;