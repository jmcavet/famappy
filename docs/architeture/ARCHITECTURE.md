# Architecture

In domain facades, do NOT inject other domain facades, nor UI facades!

On my component-scoped facades, I define:
@Injectable({ providedIn: 'root' })

A facade holds component-specific state (\_selectedDay, \_mealType, etc.) set via connect(). However, since it's a root singleton, all instances of the component share the same facade state. The last component to call connect() wins. Instead:

- remove _providedIn_ from the facade:
  @Injectable()
  export class MyComponentFacade { ... }

- define the main component as below: @Component({
  selector: 'app-my_component',
  providers: [MyComponentFacade],
  })
  export class MyComponent { ... }

## Facades

### Connect method in facade

The connect method wires component-specific inputs into the UI facade:

- @Input() or input.required() values
- Route params
- Local UI configuration

It should not pass:

- x Firestore collections
- x Backend loading flags
- x Domain-derived signals
- x Shared application states

## Domain facade and backend/firebase service

In UI facades and components, do NOT inject backend services directly, but rather domain facades.
In domain facades, do NOT inject other domain facades, nor UI facades.

The real benefit of using domain facades is that they have no knowledge of Firebase. It is an abstraction layer on top
of the service, which knows about Firestore, Firebase, etc. The domain facade is a clean interface. If I change to swap
Firebase for a REST API in the future, I will have to modify only the service file (eventually the domain facade as well,
only for example if a method returns an observable with REST API rather than signals with Firebase).
In the end, every UI component stays untouched.

"The value is architectural consistency over immediate cleanliness. Every UI component talks to domain facades, never to backend services directly. That boundary is what makes the codebase maintainable as it grows."

## Structure / Code separation in facades

Public signals that are exposed to the template should be readonly (and not public) to prevent external mutation, e.g:

```Javascript
readonly unit = signal<string>('');
```

It means I can still update its value **via the signal**:

```Javascript
this.unit.update((current) => (current === unit ? '' : unit));
```

but I can NOT reassign the signal reference entirely, such as in:

```Javascript
this.unit = signal<string>('new signal');
```

Without the _readonly_ key, the component could do (harmful!):

```Javascript
this.facade.unit = signal('something else');
```

Finally, when using the _readonly_ keyword, per default it is public. However, you can still add it in front for clarity:

```Javascript
public readonly unit = signal<string>('');
```

This would break any template bindings or computed signals that depend on the original signal reference.

Ask yourself if a property will ever be reassigned with = after initialisation. If yes → no readonly. If no → add readonly.

An example where I must add readonly is for instance:

```Javascript
private _ctx!: CookMenuContext;  // assigned later via connect()

public connect(ctx: CookMenuContext) {
  this._ctx = ctx;  // reassignment, readonly would block this
}
```

Note: _.set()_ and _.update()_ on signals are not reassignments — they mutate the value inside the signal, not the signal reference itself. That's why signals get readonly.

## Private vs Public

Private computed signals should come before public ones, e.g:

## Linked signals

linkedSignal was introduced in Angular 19 for a specific use case: a signal that has a default derived value but can be temporarily overridden.
For instance, I can define the following signal:

```Javascript
readonly ingredientName = linkedSignal(() => {
    const ingredient = this.dbIngredients().find(
      (i) => i.id === this.ingredientId(),
    );
    return ingredient?.name ?? 'none';
  });
```

and still ovveride its value somewhere else:

```Javascript
// Reset the ingredient selected
this.ingredientName.set('none');
```
