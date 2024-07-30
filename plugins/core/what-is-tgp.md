# What is TGP?

TGP (Types, Generic implementations, Profiles) is a methodology for developing and using Domain-Specific Languages (DSLs). It provides a structured way to define and implement DSLs by separating concerns into three main concepts: Types, Generic implementations (Generics), and Profiles.

## Types

Types are abstract categories used to classify components in the DSL. They help define the grammar rules, see polymorphic aggregation later on.

**Example:**
In a location DSL, you might have a types `settlement` and `state`. This type is abstract and is used to categorize components related to places where people live.

## Profile Templates (PTs)

PTs define the structure and behavior for a component of a specific type. They are used like templates that specify what parameters a profile of that PT should have.

**Example:**
```javascript
component('city', {
  type: 'settlement',
  params: [
    { id: 'name', as: 'string' },
    { id: 'population', as: 'number', byName: true },
    { id: 'area', as: 'number' }
  ]
})

component('village', {
  type: 'settlement',
  params: [
    { id: 'name', as: 'string' },
    { id: 'rural', as: 'boolean', byName: true }
  ]
})
```

In this example, city and village are PTs for the settlement type. They define the structure and behavior for cities and villages, respectively, with different sets of parameters to highlight the variability in PTs.

## Profiles
Profiles are specific instances of PTs, providing concrete values for the parameters defined in the PTs. They represent concrete examples within the DSL.

**Example:**
```javascript
component('jerusalem', {
  impl: city('Jerusalem', { population: 936000, area: 125.1})
})

component('telAviv', {
  impl: city('Tel Aviv', { population: 451523, area: 52.0})
})

component('nokdim', {
  impl: village('Nokdim', { rural: true})
})
```

In this example, jerusalem and telAviv are profiles of the city PT, representing specific cities with their names, populations, and areas. nokdim is a profile of the village PT, representing a specific village with its name and population.

## Polymorphic Aggregation
In TGP, polymorphic aggregation allows a PT to have a parameter that can accept multiple types of profiles, as long as they are of the same type. This provides flexibility in aggregating different implementations under a common interface.

**Example:**
Let's define a PT state that can aggregate multiple settlement profiles:

```javascript
component('state', {
  type: 'state',
  params: [
    { id: 'name', as: 'string' },
    { id: 'capital', type: 'settlement' },
    { id: 'settlements', type: 'settlement[]' }
  ]
})
```

Now, we can create a profile for a state that includes different PTs of settlements:

```javascript
component('israel', {
  impl: state('Israel', jerusalem(), { settlements: [jerusalem(), telAviv(), nokdim()] })
})
```

In this example, israel is a profile of the state PT, and it aggregates a city (jerusalem()), another city (telAviv()), and a village (nokdim()) under the settlements parameter.

By using the TGP methodology with these conventions, you can create a structured and flexible DSL for representing locations, with the ability to aggregate different types of settlements under a common interface.



```