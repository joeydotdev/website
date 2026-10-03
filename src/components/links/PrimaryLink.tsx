import * as React from 'react';

import clsxm from '@/lib/clsxm';

import UnstyledLink, {
  UnstyledLinkProps,
} from '@/components/links/UnstyledLink';

const PrimaryLink = React.forwardRef<HTMLAnchorElement, UnstyledLinkProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <UnstyledLink
        ref={ref}
        {...rest}
        className={clsxm(
          'inline-flex items-center',
          'font-medium text-primary-300 underline decoration-primary-600 underline-offset-2 hover:text-primary-100',
          'focus:outline-none focus-visible:rounded focus-visible:ring focus-visible:ring-primary-400 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
          className
        )}
      >
        {children}
      </UnstyledLink>
    );
  }
);

export default PrimaryLink;
