'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './DropdownMenu.module.css';

interface DropdownItemProps {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

interface DropdownMenuProps {
  isOpen: boolean;
  triggerRef: React.RefObject<any>;
  onClose: () => void;
  children: React.ReactNode;
  dropdownType?: string;
  dropdownStyle?: string;
  renderInPortal?: boolean;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  triggerRef,
  onClose,
  children,
  dropdownType,
  dropdownStyle,
  renderInPortal = false,
}) => {
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
  const [fixedPosition, setFixedPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (triggerRef.current) {
      setMenuWidth(triggerRef.current.offsetWidth);
      if (renderInPortal) {
        const rect = triggerRef.current.getBoundingClientRect();
        setFixedPosition({
          top: rect.bottom + 8,
          left: rect.left,
        });
      }
    }
  }, [triggerRef, isOpen, renderInPortal]);

  if (!isOpen) {
    return null;
  }

  const menu = (
    <ul
      className={
        dropdownStyle === 'form'
          ? styles.dropdownFormMenu
          : dropdownStyle === 'adminLight'
            ? styles.dropdownAdminLightMenu
            : styles.dropdownMenu
      }
      style={{ minWidth: menuWidth }}
      data-dropdown-type={dropdownType}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const typedChild = child as React.ReactElement<DropdownItemProps>;

          return React.cloneElement(typedChild, {
            onClick: (event: React.MouseEvent<HTMLElement>) => {
              if (typedChild.props.onClick) {
                typedChild.props.onClick(event);
              }

              if (!event.defaultPrevented) {
                onClose();
              }
            },
          });
        }
        return child;
      })}
    </ul>
  );

  if (renderInPortal && typeof document !== 'undefined') {
    return createPortal(
      <ul
        className={
          dropdownStyle === 'form'
            ? styles.dropdownFormMenu
            : dropdownStyle === 'adminLight'
              ? styles.dropdownAdminLightMenu
              : styles.dropdownMenu
        }
        style={{
          minWidth: menuWidth,
          position: 'fixed',
          top: fixedPosition.top,
          left: fixedPosition.left,
          zIndex: 1000,
        }}
        data-dropdown-type={dropdownType}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const typedChild = child as React.ReactElement<DropdownItemProps>;

            return React.cloneElement(typedChild, {
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                if (typedChild.props.onClick) {
                  typedChild.props.onClick(event);
                }

                if (!event.defaultPrevented) {
                  onClose();
                }
              },
            });
          }
          return child;
        })}
      </ul>,
      document.body
    );
  }

  return menu;
};
