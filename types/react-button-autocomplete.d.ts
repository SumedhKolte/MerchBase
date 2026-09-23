import "react";

declare module "react" {
  // Declaration merging requires the same type parameter as React's interface.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ButtonHTMLAttributes<T> {
    /**
     * Firefox restores a button's client-toggled `disabled` state on reload,
     * before React hydrates, which causes hydration mismatches for buttons the
     * server renders disabled. `autocomplete="off"` opts a button out of that
     * restoration. React's types omit it on <button>, so it's declared here.
     * https://bugzilla.mozilla.org/show_bug.cgi?id=654072
     * https://bugzilla.mozilla.org/show_bug.cgi?id=1847798
     */
    autoComplete?: "off";
  }
}
