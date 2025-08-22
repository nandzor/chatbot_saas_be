import React, { useState, useRef, useEffect } from 'react';

export const DropdownMenu = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open || false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        const newState = false;
        setIsOpen(newState);
        if (onOpenChange) {
          onOpenChange(newState);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

  const toggleMenu = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onOpenChange) {
      onOpenChange(newState);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, { onClick: toggleMenu });
        }
        if (child.type === DropdownMenuContent) {
          return isOpen ? child : null;
        }
        return child;
      })}
    </div>
  );
};

export const DropdownMenuTrigger = ({ children, asChild, onClick, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e);
        if (onClick) onClick(e);
      }
    });
  }

  return (
    <button {...props} onClick={onClick}>
      {children}
    </button>
  );
};

export const DropdownMenuContent = ({ children, align = 'center', className = '', ...props }) => {
  const alignClass = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  return (
    <div
      className={`absolute top-full mt-1 ${alignClass[align]} z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, disabled = false, className = '', ...props }) => {
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors ${
        disabled 
          ? 'pointer-events-none opacity-50' 
          : 'focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer'
      } ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuLabel = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuSeparator = ({ className = '', ...props }) => {
  return <div className={`-mx-1 my-1 h-px bg-muted ${className}`} {...props} />;
};

export default DropdownMenu;
