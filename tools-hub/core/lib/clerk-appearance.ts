export const clerkAppearance = {
  elements: {
    cardBox: "shadow-none",
    card: "border border-border bg-card text-card-foreground shadow-xl shadow-black/5 rounded-2xl",
    modalBackdrop: "bg-background/70 backdrop-blur-sm",
    headerTitle: "text-foreground text-lg font-semibold tracking-tight",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton:
      "border border-border bg-background shadow-xs text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors",
    socialButtonsBlockButtonText: "font-medium",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground text-xs uppercase tracking-[0.12em]",
    formFieldLabel: "text-foreground font-medium",
    formFieldInput:
      "h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs focus:border-ring focus:ring-2 focus:ring-ring/50",
    formButtonPrimary:
      "h-10 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
    footerActionText: "text-muted-foreground",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    identityPreviewEditButton:
      "border border-border bg-background shadow-xs text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg",
    formResendCodeLink: "text-primary hover:text-primary/80 font-medium",
    otpCodeFieldInput:
      "rounded-lg border border-input bg-background text-foreground shadow-xs focus:border-ring focus:ring-2 focus:ring-ring/50",
    alert: "rounded-lg border border-border bg-muted/40",
    alertText: "text-foreground",
    formFieldErrorText: "text-destructive",
  },
} as const;

export const userButtonAppearance = {
  elements: {
    userButtonTrigger:
      "group relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background shadow-xs transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    userButtonBox: "h-9 w-9",
    userButtonAvatarBox: "h-8 w-8 rounded-md overflow-hidden",
    avatarBox: "h-8 w-8 rounded-md overflow-hidden",
    userButtonPopoverCard:
      "mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl shadow-black/10",
    userButtonPopoverMain: "p-2",
    userPreview: "rounded-xl border border-border/70 bg-muted/30 px-3 py-3",
    userPreviewMainIdentifier: "text-sm font-semibold text-foreground",
    userPreviewSecondaryIdentifier: "text-xs text-muted-foreground",
    userButtonPopoverActions: "gap-1 p-2",
    userButtonPopoverActionButton:
      "min-h-10 rounded-xl px-3 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
    userButtonPopoverActionButtonText: "font-medium text-sm",
    userButtonPopoverActionButtonIconBox:
      "text-muted-foreground group-hover:text-foreground group-focus:text-foreground",
    userButtonPopoverFooter: "border-t border-border bg-muted/20 px-2 py-2",
  },
} as const;