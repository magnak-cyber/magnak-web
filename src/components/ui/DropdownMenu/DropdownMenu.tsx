'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  portalPlacement?: 'auto' | 'top' | 'bottom';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  triggerRef,
  onClose,
  children,
  dropdownType,
  dropdownStyle,
  renderInPortal = false,
  portalPlacement = 'auto',
}) => {
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
  const [fixedPosition, setFixedPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) {
        return;
      }

      const rect = triggerRef.current.getBoundingClientRect();
      const nextMenuWidth = triggerRef.current.offsetWidth;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuHeight = menuRef.current?.offsetHeight ?? 0;
      const preferredPlacement =
        portalPlacement === 'auto'
          ? rect.bottom + menuHeight + 12 > viewportHeight && rect.top - menuHeight - 8 > 12
            ? 'top'
            : 'bottom'
          : portalPlacement;

      const top =
        preferredPlacement === 'top'
          ? Math.max(12, rect.top - menuHeight - 8)
          : Math.min(viewportHeight - menuHeight - 12, rect.bottom + 8);
      const left = Math.min(Math.max(12, rect.left), Math.max(12, viewportWidth - nextMenuWidth - 12));

      setMenuWidth(nextMenuWidth);
      setFixedPosition({ top, left });
    };

    updatePosition();

    if (!renderInPortal) {
      return;
    }

    const frameId = window.requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [triggerRef, isOpen, renderInPortal, portalPlacement]);

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
        ref={menuRef}
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
          zIndex: 12500,
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
