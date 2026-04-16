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
