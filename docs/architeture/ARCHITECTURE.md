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

## Connect method in facade

The connect method wires component-specific inputs into the UI facade:

- @Input() or input.required() values
- Route params
- Local UI configuration

It should not pass:

- x Firestore collections
- x Backend loading flags
- x Domain-derived signals
- x Shared application states
