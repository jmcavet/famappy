# Facade architecture

## Basic architecture

Dependencies: injected services and facades
Domain-derived state: proxies to domain facade signals
Local state: signals owned and mutated by this facade
Local derived state: computed/linkedSignal from local or domain state
Public API: methods triggered by the template
Private helpers: internal methods
