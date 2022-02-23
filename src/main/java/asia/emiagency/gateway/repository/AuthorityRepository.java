package asia.emiagency.gateway.repository;

import asia.emiagency.gateway.domain.Authority;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.data.relational.core.query.Criteria;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data R2DBC repository for the {@link Authority} entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AuthorityRepository extends R2dbcRepository<Authority, String>, AuthorityRepositoryInternal {
    // just to avoid having unambigous methods
    @Override
    Flux<Authority> findAll();

    @Override
    Mono<Authority> findById(Long id);

    @Override
    <S extends Authority> Mono<S> save(S entity);
}

interface AuthorityRepositoryInternal {
    <S extends Authority> Mono<S> insert(S entity);

    <S extends Authority> Mono<S> save(S entity);

    Mono<Integer> update(Authority entity);

    Flux<Authority> findAll();

    Mono<Authority> findById(Long id);

    Flux<Authority> findAllBy(Pageable pageable);

    Flux<Authority> findAllBy(Pageable pageable, Criteria criteria);
}
