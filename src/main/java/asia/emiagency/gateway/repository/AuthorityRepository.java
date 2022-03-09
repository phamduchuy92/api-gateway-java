package asia.emiagency.gateway.repository;

import static org.springframework.data.relational.core.query.Criteria.where;

import asia.emiagency.gateway.domain.Authority;
import asia.emiagency.gateway.repository.rowmapper.AuthorityRowMapper;
import asia.emiagency.gateway.service.EntityManager;
import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.data.relational.core.query.Criteria;
import org.springframework.data.relational.core.sql.Expression;
import org.springframework.data.relational.core.sql.Select;
import org.springframework.data.relational.core.sql.SelectBuilder;
import org.springframework.data.relational.core.sql.Table;
import org.springframework.http.ResponseEntity;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.r2dbc.core.RowsFetchSpec;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data R2DBC repository for the {@link Authority} entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AuthorityRepository extends R2dbcRepository<Authority, String>, AuthorityRepositoryInternal {
    Flux<Authority> findAllBy(Pageable pageable);

    // just to avoid having unambigous methods
    @Override
    Flux<Authority> findAll();

    @Override
    Mono<Authority> findById(String id);

    @Override
    Mono<Boolean> existsById(String id);

    @Override
    Mono<Void> deleteById(String id);

    @Override
    <S extends Authority> Mono<S> save(S entity);
}

interface AuthorityRepositoryInternal {
    <S extends Authority> Mono<S> insert(S entity);

    <S extends Authority> Mono<S> save(S entity);

    Mono<Integer> update(Authority entity);

    Flux<Authority> findAll();

    Mono<Authority> findById(String id);

    Flux<Authority> findAllBy(Pageable pageable);

    Flux<Authority> findAllBy(Pageable pageable, Criteria criteria);
}

class AuthorityRepositoryInternalImpl implements AuthorityRepositoryInternal {

    private final DatabaseClient db;
    private final R2dbcEntityTemplate r2dbcEntityTemplate;
    private final EntityManager entityManager;

    private final AuthorityRowMapper authorityMapper;

    private static final Table entityTable = Table.aliased("jhi_authority", EntityManager.ENTITY_ALIAS);

    public AuthorityRepositoryInternalImpl(R2dbcEntityTemplate template, EntityManager entityManager, AuthorityRowMapper authorityMapper) {
        this.db = template.getDatabaseClient();
        this.r2dbcEntityTemplate = template;
        this.entityManager = entityManager;
        this.authorityMapper = authorityMapper;
    }

    @Override
    public Flux<Authority> findAllBy(Pageable pageable) {
        return findAllBy(pageable, null);
    }

    @Override
    public Flux<Authority> findAllBy(Pageable pageable, Criteria criteria) {
        return createQuery(pageable, criteria).all();
    }

    RowsFetchSpec<Authority> createQuery(Pageable pageable, Criteria criteria) {
        List<Expression> columns = AuthoritySqlHelper.getColumns(entityTable, EntityManager.ENTITY_ALIAS);
        SelectBuilder.SelectFromAndJoin selectFrom = Select.builder().select(columns).from(entityTable);

        String select = entityManager.createSelect(selectFrom, Authority.class, pageable, criteria);
        String alias = entityTable.getReferenceName().getReference();
        String selectWhere = Optional
            .ofNullable(criteria)
            .map(crit ->
                new StringBuilder(select)
                    .append(" ")
                    .append("WHERE")
                    .append(" ")
                    .append(alias)
                    .append(".")
                    .append(crit.toString())
                    .toString()
            )
            .orElse(select); // TODO remove once https://github.com/spring-projects/spring-data-jdbc/issues/907 will be fixed
        return db.sql(selectWhere).map(this::process);
    }

    @Override
    public Flux<Authority> findAll() {
        return findAllBy(null, null);
    }

    @Override
    public Mono<Authority> findById(String id) {
        return createQuery(null, where("name").is(id)).one();
    }

    private Authority process(Row row, RowMetadata metadata) {
        Authority entity = authorityMapper.apply(row, "e");
        return entity;
    }

    @Override
    public <S extends Authority> Mono<S> insert(S entity) {
        return entityManager.insert(entity);
    }

    @Override
    public <S extends Authority> Mono<S> save(S entity) {
        if (entity.getId() == null) {
            return insert(entity);
        } else {
            return update(entity)
                .map(numberOfUpdates -> {
                    if (numberOfUpdates.intValue() <= 0) {
                        throw new IllegalStateException("Unable to update Authority with id = " + entity.getId());
                    }
                    return entity;
                });
        }
    }

    @Override
    public Mono<Integer> update(Authority entity) {
        //fixme is this the proper way?
        return r2dbcEntityTemplate.update(entity).thenReturn(1);
    }
}
