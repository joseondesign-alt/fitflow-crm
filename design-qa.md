# Design QA — Assistant CRM FitFlow

## Comparison target

- Source visual truth: https://shadcnuikit.com/dashboard/apps/chat
- Implementation: http://127.0.0.1:3100/ — assistant opened depuis le bouton « Assistant CRM »
- Source captures: `.playwright-mcp/source-chat-selected-1280.png` and `.playwright-mcp/source-chat-mobile.png`
- Implementation captures: `.playwright-mcp/fitflow-chat-selected-1280.png` and `.playwright-mcp/fitflow-chat-mobile.png`
- Desktop viewport: 1280 × 800 CSS px, Playwright `scale: css`, device scale normalized to 1
- Mobile viewport: 390 × 844 CSS px, Playwright `scale: css`, device scale normalized to 1
- Compared state: conversation selected on desktop; list → conversation detail on mobile

## Evidence review

The source establishes a two-pane chat workspace: a searchable conversation list on the left, a selected conversation on the right, compact headers, message history and a composer. The implementation keeps that structure while replacing generic demo content with FitFlow contacts, CRM stages, channels and fitness-oriented actions.

Focused regions reviewed: conversation list/search, selected conversation header, message bubbles, quick actions, composer, and the mobile list/detail transition. No focused-region mismatch at P0/P1/P2 severity was found.

## Required fidelity surfaces

- Fonts and typography: Inter/system sans hierarchy, compact 10–17 px labels, medium-weight headings and readable message text match the restrained Shadcn dashboard tone.
- Spacing and layout rhythm: bordered two-pane frame, 340 px list rail, flexible conversation panel, 8 px controls and responsive bottom-sheet mobile frame preserve the source rhythm without horizontal overflow.
- Colors and visual tokens: neutral white/zinc surfaces, fine borders, subtle green FitFlow state accents and dark primary actions map the source system to the CRM brand.
- Image quality and asset fidelity: no source imagery was required for the chat surface; FitFlow avatars use compact initials and channel-color tokens, avoiding remote or hotlinked assets.
- Copy and app-specific text: source placeholder conversations were replaced with French fitness CRM examples, stages, IA score, WhatsApp/Email/Instagram labels and actionable CRM wording.

## Interactions verified

- Open and close the Assistant CRM dialog.
- Search conversations and filter the list in real time.
- Select a conversation; on mobile, transition from list to detail and return with the back button.
- Use quick-action chips to prefill the composer.
- Send a message; the thread updates immediately and the agent produces a contextual reply.
- Create a new conversation with a contact name and channel.
- Trigger the « Événement » action from the selected conversation.
- Responsive check at 390 × 844 and 1280 × 800.
- Local browser console after the final reload: 0 errors, 0 warnings.

## Findings

No actionable P0, P1 or P2 findings remain. The visual differences are intentional product adaptations: FitFlow branding, French copy, CRM stages, channel badges and actions relevant to a fitness studio.

## Follow-up polish (P3)

- Add real contact avatars once the CRM has an image source for each member.
- Connect the composer and quick actions to the future omnichannel API instead of the local demo state.

## Implementation checklist

- [x] Two-pane responsive chat workspace
- [x] Search, selection and unread states
- [x] Dynamic message send and agent reply
- [x] New conversation flow
- [x] Mobile list/detail navigation
- [x] Desktop and mobile captures compared against the source

final result: passed
