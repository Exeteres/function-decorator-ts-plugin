function test1(options: { a: number }) {
    return (target: Function) => {
        console.log(`Called test1 decorator with option a = ${options.a}`);
        return target;
    };
}

function test2(target: Function) {
    console.log("Called test2 decorator");
    return target;
}

@test1({ a: 123 })
@test2
export function targetFunction1() {}
