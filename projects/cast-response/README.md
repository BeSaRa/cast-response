# Cast-Response 🎯
#### Automatic HTTP Response Casting for Angular Transform API responses into real class instances with methods, computed properties, and business logic!

## 🚀 Quick Start
### Installation
```bash 
  npm install cast-response
```
### Basic Usage
```typescript
// Real class with methods!
export class User {
  id!: number;
  firstName!: string;
  lastName!: string;
  createdAt!: Date;

  // Computed property method
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Business logic method
  isRecent(): boolean {
    return new Date().getTime() - this.createdAt.getTime() < 86400000;
  }
}
```
```typescript
import { CastResponse } from 'cast-response';

@Injectable()
export class UserService {
  private http = inject(HttpClient);

  // Automatically casts response to User instance
  @CastResponse(() => User)
  getUser(id: number): Observable<User> {
    return this.http.get(`/users/${id}`);
  }

  // Automatically casts array response to User[]
  @CastResponse(() => User)
  getAllUsers(): Observable<User[]> {
    return this.http.get('/users');
  }
}
// @CastResponse Decorator it's smart, It will check if the retuned response is an object it will cast it to User 
// or if it's an array it will cast each elemnt in the array to User and it will return User[]
```

### ✨ Features
#### ✅ Automatic casting of API responses to real class instances

#### ✅ Nested object support with deep casting

#### ✅ Bi-directional interceptors for receive/send transformations

#### ✅ Base CRUD pattern with generic services

#### ✅ Type-safe with full TypeScript support

#### ✅ Zero boilerplate-works with existing Angular services

#### ✅ Wildcard support for arrays and dynamic properties

## 🎯 Core Decorators
- `@CastResponse` - **Automatic Response Casting** \
  Transform HTTP responses into class instances automatically:
```typescript
import { CastResponse } from 'cast-response';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  // if response come from API like this: 
  /*
  { 
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: '2021-01-01T00:00:00.000Z' 
  }
  */
  // Without nested object casting
  @CastResponse(() => User)
  getUser(id: number): Observable<User> {
    return this.http.get(`/users/${id}`);
  }
  // if response come from API like this: 
  /*
  { 
    id: 1,
    profile: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      totalPosts: 3
    },
    posts: [
    { id: 1, title: 'Post 1', author: { id: 1, firstName: 'Ebrahem', lastName: 'Mostafa' } },
    { id: 2, title: 'Post 2', author: { id: 2, firstName: 'Ahmed', lastName: 'Mostafa' } },
    { id: 3, title: 'Post 3', author: { id: 2, firstName: 'Mohamed', lastName: 'Mostafa' } },
    ],
    settings: {
      theme: {
        id: 1,
        name: 'theme',
        value: 'Dark'
      },
      sessionTimeout: {
        id: 2,
        name: 'sessionTimeout',
        value: 50000
      }
    }
  }
  */
  // With nested object casting
  @CastResponse(() => User, {
    shape: {
      // cast profile object to Profile class
      profile: () => Profile,
      // cast author object in each post to User class
      'posts.*.author': () => User,
      // cast all settings objects ( each value for each key in settings ) to Setting class
      'settings.{}': () => Setting
    }
  })
  getUserWithDetails(id: number): Observable<User> {
    return this.http.get(`/users/${id}?include=profile,posts,settings`);
  }
}
```
- `@CastResponseContainer` - **Centralized Configuration** \
  Define multiple casting configurations in one place:
```typescript
@CastResponseContainer({
  $default: {
    model: () => User, // model to cast response to
    shape: { profile: () => Profile } // shape of nested objects to cast
  },
  detailed: {
    model: () => User, // model to cast response to
    shape: { // shape of nested objects to cast
      profile: () => Profile,
      posts: () => Post,
      'posts.*.comments': () => Comment
    }
  }
})
@Injectable({...})
export class UserService extends BaseCrud<User> {
  protected endpoint = '/users';

  // pass undefined as model and make defind it's  fallback to to get the configuration from the @CastResponseContainer decorator
  @CastResponse(undefined, { fallback: '$default' })
  getUser(id: number): Observable<User> { /*...*/ }

  @CastResponse(undefined, { fallback: 'detailed' })
  getDetailedUser(id: number): Observable<User> { /*...*/ }
}
```
## 🔄 Interceptors System
### Model Interceptors
**Transform data during receive/send operations:**

```typescript
// create your model interceptor 
export class UserInterceptor implements InterceptorContract<User> {
  // @CastResponse Decorator will use call this mehtod after getting response from API
  // Transform incoming data from API
  receive(user: User): User {
    user.fullName = `${user.firstName} ${this.lastName}`;
    user.createdAtDate = new Date(user.createdAt);
    // ... other business logic
    // you have to return at end the model
    return user;
  }

  // Transform outgoing data to API
  send(user: Partial<User>): Partial<User> {
    const { fullName , createdAtDate} = user;
    user.createdAt = createdAtDate.toISOString();
    // delete computed properties before send it to the API 
    delete user.fullName;
    delete user.createdAtDate;
    // you have to return at end the model
    return cleanUser;
  }
}

// Attach interceptor to model
@InterceptModel(new UserInterceptor())
class User {
  id!: number;
  firstName!: string;
  lastName!: string;
  createdAt!: string;
  // computed properties not related to the model that came from API 
  fullName!: string; // Computed property
  createdAtDate: Date; // Computed property
}
```
### Send Interceptors
**Explicitly control when data is transformed before sending:**
```typescript
class FacadeService {
  @HasInterception
  @CastResponse(() => User)
  updateUser(@InterceptParam user: User): Observable<User> {
    // 'user' is automatically transformed by send interceptor
    return this.http.put(`/users/${user.id}`, user);
  }

  // Multiple parameters
  @HasInterception // just to tell the Interception system there is models to intercept before send inside these method
  // @CastResponse will use the OrderInterceptor->receive method to transform the response that came from API
  @CastResponse(() => Order)
  createOrder(
    @InterceptParam order: Order, // @InterceptParam decorator will use the send interceptor to transform order before send it to the API
    @InterceptParam customer: User // @InterceptParam decorator will use the send interceptor to transform customer before send it to the API
  ): Observable<Order> {
    return this.http.post('/orders', { order, customer });
  }
}
```
## 🏗️ Base CRUD Pattern
**Create generic base services that work with any model:**
```typescript
export abstract class BaseCrudService<T> {
  protected abstract endpoint: string;
  protected http = inject(HttpClient);

  @CastResponse(undefined, { fallback: '$default' })
  findById(id: number): Observable<T> {
    return this.http.get(`${this.endpoint}/${id}`);
  }

  @HasInterception
  @CastResponse(undefined, { fallback: '$default' })
  create(@InterceptParam data: T): Observable<T> { // here is parameter index 0 check the Concrete service to understand how to use it
    return this.http.post(this.endpoint, data);
  }

  @HasInterception
  @CastResponse(undefined, { fallback: '$default' })
  update(id: number, @InterceptParam data: Partial<T>): Observable<T> {
    return this.http.put(`${this.endpoint}/${id}`, data);
  }

  @CastResponse(undefined, { fallback: '$default' })
  findAll(): Observable<T[]> {
    return this.http.get(this.endpoint);
  }
}
```
### Concrete Services
```typescript
// User Service
// we define the default casting configuration for the User model 
// which will be used in all methods that use @CastResponse decorator that has fullback $default 
@CastResponseContainer({
  $default: {
    model: () => User,
    shape: { profile: () => Profile }
  }
})
// @InterceptionContainer use same name of the method as the @HasInterception attahced to the method and define the parameter index to intercept before send it to the API 
// in this case the 'create' method will transform data before send it to  API
@InterceptionContainer({
  create: {
    0: (user: User) => ({ ...user, createdAt: new Date() })
  }
})
@Injectable({...})
export class UserService extends BaseCrudService<User> {
  protected endpoint = '/users';
}

// Product Service
@CastResponseContainer({
  $default: {
    model: () => Product,
    shape: { category: () => Category }
  }
})
@Injectable({...})
export class ProductService extends BaseCrudService<Product> {
  protected endpoint = '/products';
}
```
## 🎨 Advanced Features
#### Wildcard Support
```typescript
@Injectable({...})
export class UserService {
  @CastResponse(() => User, {
    shape: {
      'posts.*': () => Post,              // All array items
      'posts.*.author': () => User,       // Nested array properties
      'settings.{}': () => Setting,       // Dynamic object properties
      'posts.*.comments.*': () => Comment  // Multiple wildcards
    }
  })
  getComplexData(): Observable<User> {
    return this.http.get('/complex-data');
  }
}
```
#### Response Unwrapping
```typescript

class UserService {
  // For responses like: { data: { user: {...} }, status: 'success' }
  @CastResponse(() => User, { unwrap: 'data.user' })
  getUser(id: number): Observable<User> {
    return this.http.get(`/api/users/${id}`);
  }
}
```
#### Method Reference Casting
```typescript
@Injectable({...})
class UserService extends BaseCrud<User> {
  // Reference a method that returns the class
  @CastResponse('getModel')
  getUser(id: number): Observable<User> {
    return this.http.get(`/users/${id}`);
  }

  getModel() {
    return User;
  }
}
```
### 🔧 Configuration Options

#### CastResponse Options
```typescript
interface CastResponseContract {
  fallback?: string;      // Fallback key for container lookup
  unwrap?: string;        // Property path to unwrap nested data
  shape?: Record<string, () => ClassConstructor<any>>; // Nested casting
}
```
#### Shape Configuration
* **Simple:** `'profile': () => Profile`
* **Array:** `'posts': () => Post` (auto-detects arrays)
* **Deep path:** `'posts.author': () => User`
* **Wildcard:** `'posts.*': () => Post `(all array items)
* **Object wildcard:** `'settings.{}': () => Setting` (dynamic keys)

## 💡 Best Practices
1. **Use real classes** with methods for business logic
2. **Keep interceptors focused** on data transformation only
3. **Use base CRUD pattern** for consistent service architecture
4. **Test interceptors** independently from services

### 🚀 Migration from Interfaces

#### Before (Plain Interfaces)
```typescript
interface User {
  id: number;
  name: string;
  createdAt: string; // String instead of Date
}

// No methods, no business logic
```
#### After (Real Classes)
```typescript
class User {
  id!: number;
  name!: string;
  createdAt!: Date; // Proper Date object

  get displayName(): string {
    return `User: ${this.name}`;
  }

  isRecent(): boolean {
    return new Date().getTime() - this.createdAt.getTime() < 86400000;
  }
}
```

## 📚 Examples

```typescript

@CastResponseContainer({
  $default: {
    model: () => User,
    shape: {
      profile: () => Profile,
      'posts.*': () => Post,
      'posts.*.comments.*': () => Comment
    }
  }
})
@InterceptionContainer({
  create: {
    0: (user: User) => ({ ...user, createdAt: new Date() })
  },
  update: {
    1: (user: Partial<User>) => ({ ...user, updatedAt: new Date() })
  }
})
@Injectable()
export class UserService extends BaseCrudService<User> {
  protected endpoint = '/users';

  // Custom method with different casting
  @CastResponse(() => User, {
    shape: { 'activities.*': () => Activity }
  })
  getUserWithActivities(id: number): Observable<User> {
    return this.http.get(`${this.endpoint}/${id}?include=activities`);
  }
}
```

## The Problem `cast-response` Solves 🎯

### ❌ The Current Pain Points in Angular Development
#### 1. Dumb Data Objects → No Business Logic
##### Before Cast-Response:
```typescript
// ❌ Plain interface - just a data container
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string; // String instead of Date
  birthDate: string;
  status: string;
}

// ❌ Business logic scattered everywhere in components/services
@Component({
  template: `
    <div>
      {{ getUserFullName(user) }}
      {{ isUserActive(user) }}
      {{ getUserAge(user) }}
      {{ canDeleteUser(user) }}
    </div>
  `
})
export class UserComponent {
  // ❌ Business logic mixed with presentation logic
  getUserFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  isUserActive(user: User): boolean {
    return user.status === 'active';
  }

  getUserAge(user: User): number {
    const birthDate = new Date(user.birthDate);
    return new Date().getFullYear() - birthDate.getFullYear();
  }

  canDeleteUser(user: User): boolean {
    const createdAt = new Date(user.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return user.status === 'active' && createdAt > sevenDaysAgo;
  }
}
```
#### 2. Manual Data Transformation Hell
##### Before Cast-Response:
```typescript
interface ApiUser {
  id: number;
  first_name: string; // Snake case from API
  last_name: string;
  created_at: string;
  birth_date: string;
  user_status: string;
}

interface AppUser {
  id: number;
  firstName: string; // Camel case in app
  lastName: string;
  createdAt: Date;   // Date object instead of string
  birthDate: Date;
  status: string;
}

@Injectable()
export class UserService {
  getUser(id: number): Observable<AppUser> {
    return this.http.get<ApiUser>(`/users/${id}`).pipe(
      map(apiUser => this.transformUser(apiUser)) // ❌ Manual transformation
    );
  }

  // ❌ Repetitive transformation logic
  private transformUser(apiUser: ApiUser): AppUser {
    return {
      id: apiUser.id,
      firstName: apiUser.first_name,
      lastName: apiUser.last_name,
      createdAt: new Date(apiUser.created_at), // ❌ Manual date parsing
      birthDate: new Date(apiUser.birth_date),
      status: apiUser.user_status
    };
  }

  // ❌ Duplicate logic for arrays
  getUsers(): Observable<AppUser[]> {
    return this.http.get<ApiUser[]>('/users').pipe(
      map(apiUsers => apiUsers.map(apiUser => this.transformUser(apiUser)))
    );
  }
}
```
#### 3. No Type Safety at Runtime
##### Before Cast-Response:
```typescript

interface User {
  id: number;
  name: string;
  createdAt: string; // Says it's string but API might send number
}

// ❌ Runtime errors - TypeScript only checks at compile time
const user: User = await this.http.get<User>('/user/1').toPromise();
console.log(user.createdAt.toLowerCase()); // 💥 CRASH if API sends number
```
#### 4. Inconsistent Service Patterns
##### Before Cast-Response:
```typescript
// ❌ Every service implements transformation differently
export class UserService {
  getUser(id: number): Observable<User> {
    return this.http.get(`/users/${id}`).pipe(
      map(response => this.transformUser(response.data.user))
    );
  }
}

export class ProductService {
  getProduct(id: number): Observable<Product> {
    return this.http.get(`/products/${id}`).pipe(
      map(response => ({
        ...response.product,
        createdAt: new Date(response.product.created_at)
      }))
    );
  }
}

export class OrderService {
  getOrder(id: number): Observable<Order> {
    return this.http.get(`/orders/${id}`).pipe(
      map(response => this.normalizeOrder(response))
    );
  }

  private normalizeOrder(data: any): Order {
    // ❌ Different transformation approach in every service
  }
}
```
#### 5. Complex Nested Object Handling
##### Before Cast-Response:
```typescript
interface ApiResponse {
  user: {
    id: number;
    name: string;
    profile: {
      avatar: string;
      settings: {
        theme: string;
        notifications: boolean;
      }
    };
    posts: Array<{
      id: number;
      title: string;
      comments: Array<{
        id: number;
        text: string;
        author: {
          id: number;
          name: string;
        }
      }>
    }>;
  }
}

@Injectable({...})
class UserService {
  // ❌ Nightmare of manual nested transformations
  private transformApiResponse(response: ApiResponse): User {
    return {
      ...response.user,
      profile: {
        ...response.user.profile,
        settings: {
          ...response.user.profile.settings
        }
      },
      posts: response.user.posts.map(post => ({
        ...post,
        comments: post.comments.map(comment => ({
          ...comment,
          author: {
            ...comment.author
          }
        }))
      }))
    };
  }
}
```
#### 6. No Clean Separation of Concerns
##### Before Cast-Response:
```typescript
@Component({
  template: `
    <div>
      <!-- ❌ Presentation mixed with data transformation -->
      {{ user.createdAt | date }}
      {{ calculateDiscount(product) }}
      {{ formatAddress(order.shippingAddress) }}
    </div>
  `
})
export class MyComponent {
  // ❌ Component knows too much about data structure
  calculateDiscount(product: any): number {
    return product.price * (1 - product.discount / 100);
  }

  formatAddress(address: any): string {
    return `${address.street}, ${address.city}, ${address.zipCode}`;
  }
}
```
## ✅ How Cast-Response Solves These Problems
#### 1. Smart Models with Business Logic
```typescript 
// ✅ Real class with encapsulated business logic
class User {
  id!: number;
  firstName!: string;
  lastName!: string;
  createdAt!: Date;
  birthDate!: Date;
  status!: string;

  // ✅ Business logic where it belongs
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number {
    return new Date().getFullYear() - this.birthDate.getFullYear();
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  canDelete(): boolean {
    return this.isActive() && this.isRecent();
  }

  private isRecent(): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.createdAt > sevenDaysAgo;
  }
}
```
#### 2. Automatic Transformation
```typescript
@Injectable()
export class UserService {
  // ✅ Zero boilerplate - automatic casting
  @CastResponse(() => User)
  getUser(id: number): Observable<User> {
    return this.http.get(`/users/${id}`);
  }

  // ✅ Automatic array casting
  @CastResponse(() => User)
  getUsers(): Observable<User[]> {
    return this.http.get('/users');
  }
}
```
#### 3. Type Safety at Runtime
```typescript
// ✅ Real class instances with proper types
const user: User = await this.userService.getUser(1).toPromise();
console.log(user.createdAt.getFullYear()); // ✅ Safe - it's a real Date based on your model Interceptor impelemntation  
console.log(user.fullName); // ✅ Safe - computed property
console.log(user.canDelete()); // ✅ Safe - business logic method
```
#### 4. Consistent Service Patterns
```typescript
// ✅ Base CRUD service for consistency
export abstract class BaseCrudService<T> {
  @CastResponse(undefined, { fallback: '$default' })
  findById(id: number): Observable<T> {
    return this.http.get(`${this.endpoint}/${id}`);
  }
}

// ✅ All services follow same pattern
@CastResponseContainer({
  $default: { model: () => User }
})
export class UserService extends BaseCrudService<User> {
  protected endpoint = '/users';
}

@CastResponseContainer({
  $default: { model: () => Product }
})
export class ProductService extends BaseCrudService<Product> {
  protected endpoint = '/products';
}
```
#### 5. Automatic Nested Object Casting
```typescript
@Injectable({...})
class UserService {
  // ✅ Complex nested casting in one line
  @CastResponse(() => User, {
    shape: {
      profile: () => Profile,
      'posts.*.author': () => User,
      'posts.*.comments.*': () => Comment,
      'settings.{}': () => Setting
    }
  })
  getUserWithDetails(id: number): Observable<User> {
    return this.http.get(`/users/${id}?include=all`);
  }
}
```
#### 6. Clean Separation of Concerns
```typescript
@Component({
  template: `
    <div>
      <!-- ✅ Component focuses on presentation -->
      {{ user.fullName }}
      {{ user.createdAt | date }}
      <button (click)="deleteUser()" [disabled]="!user.canDelete()">
        Delete
      </button>
    </div>
  `
})
export class UserComponent {
  user$ = this.userService.getUser(1);

  deleteUser() {
    // ✅ Business logic encapsulated in model
    this.user$.subscribe(user => {
      if (user.canDelete()) {
        this.userService.delete(user.id);
      }
    });
  }
}
```
### 🎯 Summary: Problems Solved

| Problem                  | Before Cast-Response             | After Cast-Response              |
|--------------------------|----------------------------------|----------------------------------|
| **Business Logic**	      | Scattered in components/services | Encapsulated in model classes    |
| **Data Transformation**  | Manual, repetitive code          | Automatic, zero boilerplate      |
| **Type Safety**          | Compile-time only                | Runtime type safety              |
| **Nested Objects**	      | Complex manual mapping           | Automatic deep casting           |
| **Service Consistency**  | Different patterns everywhere    | Standardized base patterns       |
| **Code Maintenance**     | High complexity, hard to change  | Clean, modular, easy to update   |
| **Date Handling**        | Manual string parsing            | Automatic Date object conversion |
| **Developer Experience** | Error-prone, time-consuming      | Productive, intuitive, safe      |

#### Cast-Response transforms Angular development from fighting with data to focusing on business logic and user experience! 🚀

## 🆘 Troubleshooting

#### Common Issues
1. #### Class methods not available?
  * Ensure you're using the casted instance, not the raw response
  * Check that `@CastResponse` is properly applied
2. #### Nested objects not casting?
  * Verify shape configuration syntax
  * Check property paths match API response structure
3. #### Send interceptors not working?
  * Don't forget `@HasInterception` on methods
  * Ensure `@InterceptParam` on parameters


## 🎉 Why Cast-Response?
**Stop using interfaces as dumb data containers!** With Cast-Response, your Angular models become:

🧠 **Smart** with business logic methods

🔄 **Bi-directional** with receive/send transformations

🏗️ **Architected** with clean service patterns

📐 **Type-safe** with full TypeScript support

🚀 **Productive** with zero boilerplate code

**Transform your Angular architecture today! 🚀**

Built with ❤️ for the Angular community—By [@BeSaRa](https://github.com/BeSaRa)
