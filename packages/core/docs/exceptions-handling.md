# Exceptions handling

It is important to segregate **errors** and **exceptions**:
* The error is not a valid case for application that can cause the application to crash.
* The exception is a valid case of an exceptional situation.

How often have you forgotten to handle exceptions in your code, and where did that result? Also, in each team, 
disagreements may arise on the handling of exceptions, which additionally imposes time costs on resolving these issues. 
Agree that using JavaScript / TypeScript we would like to immediately see that the function can potentially return or 
throw an exception in case of an exceptional situation. If you are using layered architecture, you would not want to 
remap and rethrow exceptions between layers, but it would be great to return them in a more elegant way for synchronous
and asynchronous functions.

If we remember how the callback function works, then we can understand that it can return both a result and an exception. 
From the point of view of exception handling, this is a more transparent approach, because we clearly see that the 
function can potentially return an exception and must handle it or pass it on. But the pile-up of callback functions 
leads to such a concept as "callback hell", when the nested functions are piled up into each other and we also 
constantly have to check in the if statement that the function returns an exception, which can be quite tedious.

Fortunately, in the modern JavaScript implementation, we can avoid using callbacks and work with asynchronous code using 
Promises. Let's imagine that we can return several parameters from our function. The first will be the result and the 
second will be the exception.

```typescript
import { User } from './user.entity';

class LoginException extends Error {}

async function login(username: string, password: string): [User, LoginException] {
    try {
        const response = await fetch('https://example.com/login', {
            method: 'POST',
            body: JSON.stringify({
                login,
                password,
            }),
        });
        const user = await response.json();
        return [user, null];
    } catch (e) {
        return [null, new LoginException(e.message)];
    }
}

login('johnsmith', 'eskf24!sdkfs*')
    .then(result => {
        const [user, e] = result;
        if (e) {
            console.log(`Login is failed: ${e.message}`);
        } else {
            console.log(user);
        }
    })
```

This almost solves the problem of handling exceptions, but can still be cumbersome if we need to perform multiple 
operations at the same time.

```typescript
import { login, createPost, publishPost } from './api.utils';

// Using async / await
async function createAndPublishPost() {
    const [user, loginException] = await login('johnsmith', 'eskf24!sdkfs*');
    if (loginException) {
        console.log(`Login is failed: ${loginException.message}`);
        return;
    }

    const [post, createPostException] = await createPost(user.accessToken, 'This is the brand new post!');
    if (createPostException) {
        console.log(`Creation post is failed: ${createPostException.message}`);
        return;
    }

    const [_, publishPostException] = await publishPost(user.accessToken, post.id);
    if (publishPostException) {
        console.log(`Creation post is failed: ${publishPostException.message}`);
        return;
    }

    console.log('Post is created and published');
}

// Using chain of promises
login('johnsmith', 'eskf24!sdkfs*')
    .then(async loginResult => {
        const [user, loginException] = loginResult;
        if (loginException) {
            return [null, loginException];
        }

        return createPost(user.accessToken, 'This is the brand new post!')
            .then(createPostResult => {
                const [post, createPostException] = createPostResult;
                if (createPostException) {
                    return [null, createPostException];
                }

                return [{ user, post }, null];
            });
    })
    .then(createPostResult => {
        const [obj, createPostException] = createPostResult;
        if (createPostException) {
            return [null, createPostException];
        }

        return publishPost(obj.user.accessToken, obj.post.id);
    })
    .then(publishPostResult => {
        const [_, publishPostException] = publishPostResult;
        // Can check the type of exception if needs
        if (publishPostException) {
            console.log(`Publish post is failed: ${publishPostException.message}`);
            return;
        }

        console.log('Post is created and published');
    })
```

Ideally, we would like to describe a sequence of operations in a chain and do not care if some operation falls off with 
an exception. We will have to check the success of the operation only at the end of the execution of the entire chain.
If we wrap the result of the function in such a container that will contain described logic, this will help us implement 
this approach.

In fact, a similar solution already exists and has been implemented in the Rust language.

```rust
use std::fs::File;

fn main() {
    let result = File::open("test.txt");

    let result = match result {
        Ok(file) => file,
        Err(error) => {
            panic!("Open file is failed: {:?}", error)
        },
    };
}
```

Function `open` returns `Result<T, E>` object which is actually the container of the success or exception result.

Let's assume that we have an implementation of such a container and the functions now return `Promise<Result<T, E>>`.

```typescript
import { login, createPost, publishPost } from './api.utils';
import { Result } from './result';

login('johnsmith', 'eskf24!sdkfs*')
    .then(Result.proceed(async user => {
        return (await createPost(user.accessToken, 'This is the brand new post!'))
            .map(post => ({ user, post }));
    }))
    .then(Result.proceed(obj => publishPost(obj.user.accessToken, obj.post.id)))
    .then(res => {
        res.isOk() ? console.log(res.unwrapOk()) : console.log(`Publish post is failed: ${res.unwrapErr().message}`);
    })
```

As you can see, our code has become cleaner and more understandable. `Result.proceed` function checks if previous
function result was failed and ensures that calls to the next api functions will not be called.

For synchronous functions you just need to call `proceed` method of this function.

```typescript
import { funcOne, funcTwo, funcThree } from './utils';

const result = funcOne()
    .proceed(funcTwo)
    .proceed(funcThree);
```

What potential problems can arise using this approach:
* Your team needs to spend some time learning this concept.
* Need to wrap low-level api to `Result` container, for example `fetch` api.

NestJS Boilerplate by default returns `Result<T, E>` container for functions that can return exceptions.
More details on `Result` class can be found in the corresponding [section](./utils.md).
