alias.format(provider2.format)

private.externalWithAlias({
    impl: dataTest(format('aa'), equals('--aa--'))
})

private.externalNoAlias({
    impl: dataTest(provider2.format('aa'), equals('--aa--'))
})